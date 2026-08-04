import {
  PDFDocument,
  StandardFonts,
  rgb,
  type PDFFont,
  type PDFPage,
} from "pdf-lib";
import {
  parseSummaryMarkdown,
  type SummaryBlock,
  type SummaryInline,
} from "./summary-markdown";

const PAGE_WIDTH = 612;
const PAGE_HEIGHT = 792;
const MARGIN = 54;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
const BOTTOM_MARGIN = MARGIN + 18;

const ink = rgb(0.13, 0.14, 0.16);
const muted = rgb(0.42, 0.42, 0.46);
const accent = rgb(0.08, 0.55, 0.49);
const lineColor = rgb(0.86, 0.87, 0.88);
const softFill = rgb(0.96, 0.97, 0.97);
const codeFill = rgb(0.94, 0.96, 0.96);

type Fonts = {
  regular: PDFFont;
  bold: PDFFont;
  italic: PDFFont;
  boldItalic: PDFFont;
  code: PDFFont;
};

function toPdfText(value: string) {
  return value
    .replace(/[→⇒⟶]/g, "->")
    .replace(/[←⇐⟵]/g, "<-")
    .replace(/[–—−]/g, "-")
    .replace(/[“”„]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/…/g, "...")
    .replace(/[•◦▪]/g, "-")
    .normalize("NFKD")
    .replace(/[^\x09\x0A\x0D\x20-\x7E]/g, "?");
}

function fontFor(run: SummaryInline, fonts: Fonts) {
  if (run.code) return fonts.code;
  if (run.bold && run.italic) return fonts.boldItalic;
  if (run.bold) return fonts.bold;
  if (run.italic) return fonts.italic;
  return fonts.regular;
}

function appendRun(lines: SummaryInline[][], run: SummaryInline) {
  const line = lines.at(-1)!;
  const previous = line.at(-1);
  if (
    previous &&
    previous.bold === run.bold &&
    previous.italic === run.italic &&
    previous.code === run.code
  ) {
    previous.text += run.text;
  } else {
    line.push({ ...run });
  }
}

function wrapRuns(
  runs: SummaryInline[],
  fonts: Fonts,
  size: number,
  maxWidth: number,
) {
  const lines: SummaryInline[][] = [[]];
  let width = 0;
  let pendingSpace: SummaryInline | null = null;

  for (const originalRun of runs) {
    const run = { ...originalRun, text: toPdfText(originalRun.text) };
    const tokens = run.text.split(/(\s+)/).filter(Boolean);
    for (const token of tokens) {
      if (/^\s+$/.test(token)) {
        pendingSpace = { ...run, text: " " };
        continue;
      }

      const font = fontFor(run, fonts);
      const wordWidth = font.widthOfTextAtSize(token, size);
      const spaceWidth = pendingSpace
        ? fontFor(pendingSpace, fonts).widthOfTextAtSize(" ", size)
        : 0;
      if (width > 0 && width + spaceWidth + wordWidth > maxWidth) {
        lines.push([]);
        width = 0;
        pendingSpace = null;
      }

      if (pendingSpace && width > 0) {
        appendRun(lines, pendingSpace);
        width += spaceWidth;
      }

      if (wordWidth <= maxWidth) {
        appendRun(lines, { ...run, text: token });
        width += wordWidth;
      } else {
        for (const character of token) {
          const characterWidth = font.widthOfTextAtSize(character, size);
          if (width > 0 && width + characterWidth > maxWidth) {
            lines.push([]);
            width = 0;
          }
          appendRun(lines, { ...run, text: character });
          width += characterWidth;
        }
      }
      pendingSpace = null;
    }
  }

  return lines.filter((line) => line.length > 0);
}

function forceStyle(runs: SummaryInline[], style: Partial<SummaryInline>) {
  return runs.map((run) => ({ ...run, ...style }));
}

export async function createSummaryPdf({
  documentName,
  summary,
  model,
  createdAt,
}: {
  documentName: string;
  summary: string;
  model: string | null;
  createdAt: string;
}) {
  const pdf = await PDFDocument.create();
  const fonts: Fonts = {
    regular: await pdf.embedFont(StandardFonts.Helvetica),
    bold: await pdf.embedFont(StandardFonts.HelveticaBold),
    italic: await pdf.embedFont(StandardFonts.HelveticaOblique),
    boldItalic: await pdf.embedFont(StandardFonts.HelveticaBoldOblique),
    code: await pdf.embedFont(StandardFonts.Courier),
  };
  let page!: PDFPage;
  let y = 0;
  let pageNumber = 0;

  const addPage = () => {
    page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    pageNumber += 1;
    y = PAGE_HEIGHT - MARGIN;
    page.drawText("NEXUS / OPS", {
      x: MARGIN,
      y,
      size: 9,
      font: fonts.bold,
      color: accent,
    });
    const pageLabel = `DOCUMENT SUMMARY  /  ${pageNumber}`;
    page.drawText(pageLabel, {
      x:
        PAGE_WIDTH -
        MARGIN -
        fonts.regular.widthOfTextAtSize(pageLabel, 8),
      y,
      size: 8,
      font: fonts.regular,
      color: muted,
    });
    page.drawLine({
      start: { x: MARGIN, y: y - 12 },
      end: { x: PAGE_WIDTH - MARGIN, y: y - 12 },
      thickness: 0.7,
      color: lineColor,
    });
    y -= 42;
  };

  const ensureSpace = (height: number) => {
    if (y - height < BOTTOM_MARGIN) addPage();
  };

  const drawRuns = (
    runs: SummaryInline[],
    x: number,
    baseline: number,
    size: number,
    color = ink,
  ) => {
    let cursor = x;
    for (const run of runs) {
      const text = toPdfText(run.text);
      const font = fontFor(run, fonts);
      const runWidth = font.widthOfTextAtSize(text, size);
      if (run.code) {
        page.drawRectangle({
          x: cursor - 1.5,
          y: baseline - 2,
          width: runWidth + 3,
          height: size + 4,
          color: codeFill,
        });
      }
      page.drawText(text, {
        x: cursor,
        y: baseline,
        size,
        font,
        color: run.code ? rgb(0.07, 0.39, 0.36) : color,
      });
      cursor += runWidth;
    }
  };

  const drawTextBlock = (
    runs: SummaryInline[],
    options: {
      x?: number;
      width?: number;
      size?: number;
      lineHeight?: number;
      color?: ReturnType<typeof rgb>;
      before?: number;
      after?: number;
    } = {},
  ) => {
    const x = options.x ?? MARGIN;
    const size = options.size ?? 10.5;
    const lineHeight = options.lineHeight ?? 15.5;
    const lines = wrapRuns(
      runs,
      fonts,
      size,
      options.width ?? CONTENT_WIDTH,
    );
    y -= options.before ?? 0;
    for (const line of lines) {
      ensureSpace(lineHeight);
      drawRuns(line, x, y, size, options.color);
      y -= lineHeight;
    }
    y -= options.after ?? 0;
  };

  const drawTable = (block: Extract<SummaryBlock, { type: "table" }>) => {
    const columnCount = Math.max(
      1,
      block.headers.length,
      ...block.rows.map((row) => row.length),
    );
    const cellWidth = CONTENT_WIDTH / columnCount;
    const fontSize = columnCount > 5 ? 7.25 : columnCount > 3 ? 8 : 8.75;
    const lineHeight = fontSize + 3.25;

    const rowHeight = (cells: SummaryInline[][]) =>
      Math.max(
        25,
        ...Array.from({ length: columnCount }, (_, index) =>
          wrapRuns(cells[index] ?? [{ text: "" }], fonts, fontSize, cellWidth - 12)
            .length * lineHeight + 12,
        ),
      );

    const drawRow = (cells: SummaryInline[][], header: boolean) => {
      const height = rowHeight(cells);
      ensureSpace(height);
      if (header) {
        page.drawRectangle({
          x: MARGIN,
          y: y - height + 4,
          width: CONTENT_WIDTH,
          height,
          color: softFill,
        });
      }
      for (let column = 0; column < columnCount; column += 1) {
        const x = MARGIN + column * cellWidth;
        if (column > 0) {
          page.drawLine({
            start: { x, y: y + 4 },
            end: { x, y: y - height + 4 },
            thickness: 0.45,
            color: lineColor,
          });
        }
        const runs = header
          ? forceStyle(cells[column] ?? [], { bold: true })
          : cells[column] ?? [];
        const lines = wrapRuns(runs, fonts, fontSize, cellWidth - 12);
        let cellY = y - fontSize;
        for (const line of lines) {
          drawRuns(line, x + 6, cellY, fontSize);
          cellY -= lineHeight;
        }
      }
      page.drawLine({
        start: { x: MARGIN, y: y - height + 4 },
        end: { x: PAGE_WIDTH - MARGIN, y: y - height + 4 },
        thickness: 0.55,
        color: lineColor,
      });
      y -= height;
    };

    y -= 8;
    drawRow(block.headers, true);
    for (const row of block.rows) {
      const height = rowHeight(row);
      if (y - height < BOTTOM_MARGIN) {
        addPage();
        drawRow(block.headers, true);
      }
      drawRow(row, false);
    }
    y -= 10;
  };

  addPage();
  const titleLines = wrapRuns(
    [{ text: documentName, bold: true }],
    fonts,
    20,
    CONTENT_WIDTH,
  );
  for (const line of titleLines) {
    drawRuns(line, MARGIN, y, 20);
    y -= 25;
  }
  y -= 4;
  const date = new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeZone: "UTC",
  }).format(new Date(createdAt));
  page.drawText(toPdfText(`Generated ${date} / ${model || "AI model"}`), {
    x: MARGIN,
    y,
    size: 9,
    font: fonts.regular,
    color: muted,
  });
  y -= 28;

  const blocks = parseSummaryMarkdown(summary);
  for (const block of blocks) {
    if (block.type === "heading") {
      const size = block.level === 1 ? 17 : block.level === 2 ? 14.5 : 12;
      drawTextBlock(forceStyle(block.content, { bold: true }), {
        size,
        lineHeight: size + 5,
        before: block.level <= 2 ? 13 : 9,
        after: 5,
      });
    } else if (block.type === "paragraph") {
      drawTextBlock(block.content, { after: 8 });
    } else if (block.type === "blockquote") {
      const lines = wrapRuns(block.content, fonts, 10.25, CONTENT_WIDTH - 20);
      y -= 5;
      for (const line of lines) {
        ensureSpace(16);
        page.drawLine({
          start: { x: MARGIN + 2, y: y + 9 },
          end: { x: MARGIN + 2, y: y - 6 },
          thickness: 1.5,
          color: accent,
        });
        drawRuns(line, MARGIN + 16, y, 10.25, muted);
        y -= 16;
      }
      y -= 8;
    } else if (block.type === "list") {
      y -= 3;
      block.items.forEach((item, index) => {
        const marker = block.ordered ? `${index + 1}.` : "";
        const lines = wrapRuns(item, fonts, 10.5, CONTENT_WIDTH - 24);
        lines.forEach((line, lineIndex) => {
          ensureSpace(16);
          if (lineIndex === 0) {
            if (block.ordered) {
              page.drawText(marker, {
                x: MARGIN + 2,
                y,
                size: 9.5,
                font: fonts.bold,
                color: accent,
              });
            } else {
              page.drawRectangle({
                x: MARGIN + 4,
                y: y + 3,
                width: 4,
                height: 4,
                color: accent,
              });
            }
          }
          drawRuns(line, MARGIN + 24, y, 10.5);
          y -= 16;
        });
        y -= 2;
      });
      y -= 6;
    } else if (block.type === "code") {
      y -= 5;
      const codeLines = block.value.split("\n").flatMap((line) =>
        wrapRuns([{ text: line || " ", code: true }], fonts, 8.5, CONTENT_WIDTH - 20),
      );
      for (const line of codeLines) {
        ensureSpace(15);
        page.drawRectangle({
          x: MARGIN,
          y: y - 4,
          width: CONTENT_WIDTH,
          height: 15,
          color: codeFill,
        });
        drawRuns(line, MARGIN + 10, y, 8.5);
        y -= 15;
      }
      y -= 9;
    } else if (block.type === "rule") {
      ensureSpace(24);
      y -= 8;
      page.drawLine({
        start: { x: MARGIN, y },
        end: { x: PAGE_WIDTH - MARGIN, y },
        thickness: 0.7,
        color: lineColor,
      });
      y -= 16;
    } else {
      drawTable(block);
    }
  }

  pdf.setTitle(`${documentName} - Summary`);
  pdf.setAuthor("NexusOps");
  pdf.setSubject("AI-generated document summary");
  return pdf.save();
}
