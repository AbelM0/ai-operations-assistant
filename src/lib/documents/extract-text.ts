import "server-only";

import { mkdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { createWorker, type Worker } from "tesseract.js";
import {
  definePDFJSModule,
  extractText as extractPdfText,
  getDocumentProxy,
  renderPageAsImage,
} from "unpdf";
import type { ExtractedPage } from "./chunk-text";

export type ExtractedDocument = {
  pages: ExtractedPage[];
  pageCount: number;
  parserUsed: string;
  ocrEngine: string | null;
};

let pdfJsModulePromise: Promise<void> | undefined;

function configurePdfJsForNode() {
  pdfJsModulePromise ??= definePDFJSModule(
    () => import("pdfjs-dist/legacy/build/pdf.mjs"),
  );
  return pdfJsModulePromise;
}

function normalizeText(value: string) {
  return value
    .replace(/\u0000/g, "")
    .replace(/[\t ]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

async function createOcrWorker() {
  const languages = (process.env.OCR_LANGUAGES || "eng+amh")
    .split("+")
    .map((language) => language.trim())
    .filter(Boolean);
  const cachePath =
    process.env.TESSERACT_CACHE_PATH || path.join(process.cwd(), ".cache", "tesseract");

  await mkdir(cachePath, { recursive: true });

  return createWorker(languages, undefined, { cachePath });
}

async function recognizeImage(worker: Worker, image: Buffer | ArrayBuffer) {
  const input = Buffer.isBuffer(image) ? image : Buffer.from(new Uint8Array(image));
  const normalizedImage = await sharp(input).rotate().png().toBuffer();
  const result = await worker.recognize(normalizedImage);
  return normalizeText(result.data.text);
}

async function extractPdf(file: ArrayBuffer): Promise<ExtractedDocument> {
  await configurePdfJsForNode();
  const pdf = await getDocumentProxy(new Uint8Array(file));
  let worker: Worker | undefined;

  try {
    const { totalPages, text } = await extractPdfText(pdf, { mergePages: false });
    const pages: ExtractedPage[] = [];
    let usedOcr = false;

    for (let index = 0; index < totalPages; index += 1) {
      let pageText = normalizeText(text[index] || "");

      if (pageText.length < 20) {
        worker ??= await createOcrWorker();
        const renderedPage = await renderPageAsImage(pdf, index + 1, {
          canvasImport: () => import("@napi-rs/canvas"),
          scale: 2,
        });
        pageText = await recognizeImage(worker, renderedPage);
        usedOcr = true;
      }

      if (pageText) {
        pages.push({ pageNumber: index + 1, text: pageText });
      }
    }

    if (pages.length === 0) {
      throw new Error("No readable text was found in the PDF.");
    }

    return {
      pages,
      pageCount: totalPages,
      parserUsed: usedOcr ? "unpdf+tesseract.js" : "unpdf",
      ocrEngine: usedOcr ? "tesseract.js" : null,
    };
  } finally {
    await worker?.terminate();
    await pdf.destroy();
  }
}

async function extractImage(file: ArrayBuffer): Promise<ExtractedDocument> {
  const worker = await createOcrWorker();

  try {
    const text = await recognizeImage(worker, file);

    if (!text) {
      throw new Error("No readable text was found in the image.");
    }

    return {
      pages: [{ pageNumber: 1, text }],
      pageCount: 1,
      parserUsed: "tesseract.js",
      ocrEngine: "tesseract.js",
    };
  } finally {
    await worker.terminate();
  }
}

export async function extractDocumentText(file: Blob, mimeType: string) {
  const buffer = await file.arrayBuffer();

  if (mimeType === "application/pdf") {
    return extractPdf(buffer);
  }

  if (mimeType.startsWith("image/")) {
    return extractImage(buffer);
  }

  throw new Error(`Unsupported document type: ${mimeType}.`);
}
