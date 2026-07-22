import "server-only";

export type ExtractedPage = {
  pageNumber: number;
  text: string;
};

export type DocumentChunkInput = {
  chunkIndex: number;
  pageNumber: number;
  tokenCount: number;
  textContent: string;
};

const CHUNK_WORDS = 420;
const OVERLAP_WORDS = 70;

export function chunkPages(pages: ExtractedPage[]): DocumentChunkInput[] {
  const chunks: DocumentChunkInput[] = [];
  const step = CHUNK_WORDS - OVERLAP_WORDS;

  for (const page of pages) {
    const words = page.text.split(/\s+/).filter(Boolean);

    for (let start = 0; start < words.length; start += step) {
      const selectedWords = words.slice(start, start + CHUNK_WORDS);
      const textContent = selectedWords.join(" ").trim();

      if (!textContent) continue;

      chunks.push({
        chunkIndex: chunks.length,
        pageNumber: page.pageNumber,
        tokenCount: Math.ceil(textContent.length / 4),
        textContent,
      });

      if (start + CHUNK_WORDS >= words.length) break;
    }
  }

  return chunks;
}

