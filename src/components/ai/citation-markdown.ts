type MarkdownNode = {
  type: string;
  value?: string;
  url?: string;
  children?: MarkdownNode[];
};

export type CitationTextSegment =
  | { type: "text"; value: string }
  | { type: "citation"; value: string };

export function splitCitationText(value: string, validSourceIds: Set<string>) {
  const segments: CitationTextSegment[] = [];
  const citationPattern = /\[(S\d+)\]/g;
  let cursor = 0;

  for (const match of value.matchAll(citationPattern)) {
    const index = match.index ?? 0;
    if (index > cursor) {
      segments.push({ type: "text", value: value.slice(cursor, index) });
    }
    const sourceId = match[1];
    if (sourceId && validSourceIds.has(sourceId)) {
      segments.push({ type: "citation", value: sourceId });
    } else {
      segments.push({ type: "text", value: match[0] });
    }
    cursor = index + match[0].length;
  }

  if (cursor < value.length) {
    segments.push({ type: "text", value: value.slice(cursor) });
  }
  return segments.length ? segments : [{ type: "text" as const, value }];
}

export function citationRemarkPlugin(validSourceIds: Set<string>) {
  return () => (tree: MarkdownNode) => {
    const visit = (node: MarkdownNode) => {
      if (!node.children) return;
      if (["code", "inlineCode", "link", "linkReference"].includes(node.type)) {
        return;
      }

      for (let index = node.children.length - 1; index >= 0; index -= 1) {
        const child = node.children[index];
        if (!child) continue;

        // During incremental Markdown parsing a bracketed marker can be
        // interpreted as a link reference (especially when emphasis markers
        // are still unbalanced). Convert an exact, valid marker back into the
        // same citation link we use for ordinary text nodes.
        if (child.type === "linkReference") {
          const referenceText = child.children
            ?.filter(
              (referenceChild) =>
                referenceChild.type === "text" &&
                typeof referenceChild.value === "string",
            )
            .map((referenceChild) => referenceChild.value)
            .join("");
          const sourceId = referenceText?.match(/^\[(S\d+)\]$/)?.[1];
          if (sourceId && validSourceIds.has(sourceId)) {
            node.children.splice(index, 1, {
              type: "link",
              url: `#citation-${sourceId}`,
              children: [{ type: "text", value: `[${sourceId}]` }],
            });
            continue;
          }
        }

        if (child.type !== "text" || typeof child.value !== "string") {
          visit(child);
          continue;
        }

        const segments = splitCitationText(child.value, validSourceIds);
        if (!segments.some((segment) => segment.type === "citation")) continue;
        node.children.splice(
          index,
          1,
          ...segments.map((segment): MarkdownNode =>
            segment.type === "citation"
              ? {
                  type: "link",
                  url: `#citation-${segment.value}`,
                  children: [{ type: "text", value: `[${segment.value}]` }],
                }
              : { type: "text", value: segment.value },
          ),
        );
      }
    };

    visit(tree);
  };
}
