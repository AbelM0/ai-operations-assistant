import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";

const PAGE_WIDTH = 612;
const PAGE_HEIGHT = 792;
const MARGIN = 54;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

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

function cleanMarkdown(value: string) {
  return toPdfText(value
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/__(.*?)__/g, "$1")
    .replace(/^[-*]\s+/gm, "- ")
    .replace(/`([^`]+)`/g, "$1"));
}

function wrapText(text: string, font: PDFFont, size: number, maxWidth: number) {
  const lines: string[] = [];
  for (const paragraph of text.split("\n")) {
    if (!paragraph.trim()) {
      lines.push("");
      continue;
    }
    const words = paragraph.split(/\s+/);
    let line = "";
    for (const word of words) {
      const candidate = line ? `${line} ${word}` : word;
      if (font.widthOfTextAtSize(candidate, size) <= maxWidth) line = candidate;
      else {
        if (line) lines.push(line);
        line = word;
      }
    }
    if (line) lines.push(line);
  }
  return lines;
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
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  let page!: PDFPage;
  let y = 0;
  let pageNumber = 0;

  const addPage = () => {
    page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    pageNumber += 1;
    y = PAGE_HEIGHT - MARGIN;
    page.drawText("NEXUS / OPS", { x: MARGIN, y, size: 9, font: bold, color: rgb(0.08, 0.55, 0.49) });
    page.drawText(`DOCUMENT SUMMARY  /  ${pageNumber}`, { x: PAGE_WIDTH - MARGIN - 126, y, size: 8, font: regular, color: rgb(0.42, 0.42, 0.46) });
    page.drawLine({ start: { x: MARGIN, y: y - 12 }, end: { x: PAGE_WIDTH - MARGIN, y: y - 12 }, thickness: 0.7, color: rgb(0.86, 0.87, 0.88) });
    y -= 42;
  };

  addPage();
  const safeDocumentName = toPdfText(documentName);
  const titleLines = wrapText(safeDocumentName, bold, 20, CONTENT_WIDTH);
  for (const line of titleLines) {
    page!.drawText(line, { x: MARGIN, y, size: 20, font: bold, color: rgb(0.07, 0.08, 0.09) });
    y -= 25;
  }
  y -= 4;
  const date = new Intl.DateTimeFormat("en", { dateStyle: "medium", timeZone: "UTC" }).format(new Date(createdAt));
  page!.drawText(toPdfText(`Generated ${date} / ${model || "AI model"}`), { x: MARGIN, y, size: 9, font: regular, color: rgb(0.42, 0.42, 0.46) });
  y -= 30;

  const summaryLines = wrapText(cleanMarkdown(summary), regular, 10.5, CONTENT_WIDTH);
  for (const line of summaryLines) {
    if (y < MARGIN + 24) addPage();
    if (!line) {
      y -= 8;
      continue;
    }
    page!.drawText(line, { x: MARGIN, y, size: 10.5, font: regular, color: rgb(0.13, 0.14, 0.16) });
    y -= 16;
  }

  pdf.setTitle(`${documentName} - Summary`);
  pdf.setAuthor("NexusOps");
  pdf.setSubject("AI-generated document summary");
  return pdf.save();
}
