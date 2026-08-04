export type SummaryInline = {
  text: string;
  bold?: boolean;
  italic?: boolean;
  code?: boolean;
};

export type SummaryBlock =
  | { type: "heading"; level: number; content: SummaryInline[] }
  | { type: "paragraph"; content: SummaryInline[] }
  | { type: "list"; ordered: boolean; items: SummaryInline[][] }
  | { type: "blockquote"; content: SummaryInline[] }
  | { type: "code"; value: string }
  | { type: "rule" }
  | {
      type: "table";
      headers: SummaryInline[][];
      rows: SummaryInline[][][];
    };

type InlineStyle = Omit<SummaryInline, "text">;

function appendRun(
  runs: SummaryInline[],
  text: string,
  style: InlineStyle = {},
) {
  const value = text
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/\\([\\`*_[\]{}()#+.!|>~-])/g, "$1");
  if (!value) return;
  const previous = runs.at(-1);
  if (
    previous &&
    previous.bold === style.bold &&
    previous.italic === style.italic &&
    previous.code === style.code
  ) {
    previous.text += value;
    return;
  }
  runs.push({ text: value, ...style });
}

const inlinePatterns = [
  { kind: "image", pattern: /!\[([^\]]*)\]\([^)]+\)/ },
  { kind: "code", pattern: /`([^`]+)`/ },
  { kind: "bold", pattern: /\*\*([^*]+)\*\*|__([^_]+)__/ },
  { kind: "strike", pattern: /~~([^~]+)~~/ },
  { kind: "link", pattern: /\[([^\]]+)\]\([^)]+\)/ },
  { kind: "italic", pattern: /\*([^*\n]+)\*|_([^_\n]+)_/ },
] as const;

export function parseSummaryInline(
  value: string,
  inheritedStyle: InlineStyle = {},
): SummaryInline[] {
  const runs: SummaryInline[] = [];
  let remaining = value;

  while (remaining) {
    const candidates = inlinePatterns
      .map((entry) => ({ ...entry, match: entry.pattern.exec(remaining) }))
      .filter(
        (entry): entry is (typeof inlinePatterns)[number] & {
          match: RegExpExecArray;
        } => Boolean(entry.match),
      )
      .sort((a, b) => (a.match.index ?? 0) - (b.match.index ?? 0));
    const candidate = candidates[0];

    if (!candidate?.match) {
      appendRun(runs, remaining, inheritedStyle);
      break;
    }

    const index = candidate.match.index ?? 0;
    appendRun(runs, remaining.slice(0, index), inheritedStyle);
    const content = candidate.match[1] || candidate.match[2] || "";

    if (candidate.kind === "code") {
      appendRun(runs, content, { ...inheritedStyle, code: true });
    } else if (candidate.kind === "image") {
      appendRun(runs, content, { ...inheritedStyle, italic: true });
    } else {
      const nestedStyle = {
        ...inheritedStyle,
        ...(candidate.kind === "bold" ? { bold: true } : {}),
        ...(candidate.kind === "italic" ? { italic: true } : {}),
      };
      for (const run of parseSummaryInline(content, nestedStyle)) {
        appendRun(runs, run.text, run);
      }
    }

    remaining = remaining.slice(index + candidate.match[0].length);
  }

  return runs;
}

function isTableDivider(value: string) {
  return /^\s*\|?\s*:?-{3,}:?\s*(?:\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(
    value,
  );
}

function splitTableRow(value: string) {
  const cells: string[] = [];
  let cell = "";
  let escaped = false;
  const trimmed = value.trim().replace(/^\|/, "").replace(/\|$/, "");
  for (const character of trimmed) {
    if (escaped) {
      cell += character;
      escaped = false;
    } else if (character === "\\") {
      escaped = true;
    } else if (character === "|") {
      cells.push(cell.trim());
      cell = "";
    } else {
      cell += character;
    }
  }
  cells.push(cell.trim());
  return cells;
}

function startsBlock(lines: string[], index: number) {
  const line = lines[index] ?? "";
  const next = lines[index + 1] ?? "";
  return (
    !line.trim() ||
    /^#{1,6}\s+/.test(line) ||
    /^\s*(```|~~~)/.test(line) ||
    /^\s*([-*_])(?:\s*\1){2,}\s*$/.test(line) ||
    /^\s*>/.test(line) ||
    /^\s*[-+*]\s+/.test(line) ||
    /^\s*\d+[.)]\s+/.test(line) ||
    (line.includes("|") && isTableDivider(next))
  );
}

export function parseSummaryMarkdown(markdown: string): SummaryBlock[] {
  const lines = markdown.replace(/\r\n?/g, "\n").split("\n");
  const blocks: SummaryBlock[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index] ?? "";
    if (!line.trim()) {
      index += 1;
      continue;
    }

    const fence = /^\s*(```|~~~)/.exec(line);
    if (fence) {
      const marker = fence[1];
      const code: string[] = [];
      index += 1;
      while (index < lines.length && !lines[index]?.trimStart().startsWith(marker)) {
        code.push(lines[index] ?? "");
        index += 1;
      }
      if (index < lines.length) index += 1;
      blocks.push({ type: "code", value: code.join("\n") });
      continue;
    }

    const heading = /^(#{1,6})\s+(.+)$/.exec(line);
    if (heading) {
      blocks.push({
        type: "heading",
        level: heading[1].length,
        content: parseSummaryInline(heading[2]),
      });
      index += 1;
      continue;
    }

    if (/^\s*([-*_])(?:\s*\1){2,}\s*$/.test(line)) {
      blocks.push({ type: "rule" });
      index += 1;
      continue;
    }

    if (line.includes("|") && isTableDivider(lines[index + 1] ?? "")) {
      const headers = splitTableRow(line).map((cell) =>
        parseSummaryInline(cell),
      );
      const rows: SummaryInline[][][] = [];
      index += 2;
      while (index < lines.length && (lines[index] ?? "").includes("|")) {
        rows.push(
          splitTableRow(lines[index] ?? "").map((cell) =>
            parseSummaryInline(cell),
          ),
        );
        index += 1;
      }
      blocks.push({ type: "table", headers, rows });
      continue;
    }

    if (/^\s*>/.test(line)) {
      const quote: string[] = [];
      while (index < lines.length && /^\s*>/.test(lines[index] ?? "")) {
        quote.push((lines[index] ?? "").replace(/^\s*>\s?/, ""));
        index += 1;
      }
      blocks.push({
        type: "blockquote",
        content: parseSummaryInline(quote.join(" ")),
      });
      continue;
    }

    const unordered = /^\s*[-+*]\s+(.+)$/.exec(line);
    const ordered = /^\s*\d+[.)]\s+(.+)$/.exec(line);
    if (unordered || ordered) {
      const isOrdered = Boolean(ordered);
      const items: SummaryInline[][] = [];
      const itemPattern = isOrdered
        ? /^\s*\d+[.)]\s+(.+)$/
        : /^\s*[-+*]\s+(.+)$/;
      while (index < lines.length) {
        const item = itemPattern.exec(lines[index] ?? "");
        if (!item) break;
        items.push(parseSummaryInline(item[1]));
        index += 1;
      }
      blocks.push({ type: "list", ordered: isOrdered, items });
      continue;
    }

    const paragraph = [line.trim()];
    index += 1;
    while (index < lines.length && !startsBlock(lines, index)) {
      paragraph.push((lines[index] ?? "").trim());
      index += 1;
    }
    blocks.push({
      type: "paragraph",
      content: parseSummaryInline(paragraph.join(" ")),
    });
  }

  return blocks;
}

function inlineText(runs: SummaryInline[]) {
  return runs.map((run) => run.text).join("");
}

export function summaryMarkdownToPlainText(markdown: string) {
  return parseSummaryMarkdown(markdown)
    .map((block) => {
      if (block.type === "heading" || block.type === "paragraph") {
        return inlineText(block.content);
      }
      if (block.type === "blockquote") return `> ${inlineText(block.content)}`;
      if (block.type === "code") return block.value;
      if (block.type === "rule") return "";
      if (block.type === "list") {
        return block.items
          .map((item, index) =>
            `${block.ordered ? `${index + 1}.` : "-"} ${inlineText(item)}`,
          )
          .join("\n");
      }
      return [block.headers, ...block.rows]
        .map((row) => row.map(inlineText).join("\t"))
        .join("\n");
    })
    .filter(Boolean)
    .join("\n\n");
}
