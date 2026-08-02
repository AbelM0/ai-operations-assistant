import "server-only";

import { getEmbeddingProvider } from "@/lib/ai/embeddings";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { buildEvidenceExcerpt } from "./evidence";
import type { BuiltContext, RagSource, RetrievedChunk } from "./types";

type MatchDocumentsRow = {
  chunk_id: string;
  document_id: string;
  document_name: string;
  chunk_index: number;
  page_number: number | null;
  text_content: string;
  vector_similarity: number;
  keyword_rank: number;
  rrf_score: number;
};

type ContextGroup = {
  documentId: string;
  documentName: string;
  chunks: RetrievedChunk[];
  text: string;
  score: number;
  similarity: number;
};

const DEFAULT_MATCH_COUNT = 14;
const DEFAULT_MATCH_THRESHOLD = 0.32;
const DEFAULT_CONTEXT_TOKENS = 7_000;

function positiveInteger(value: string | undefined, fallback: number) {
  const parsed = Number.parseInt(value || "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function numeric(value: string | undefined, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function estimateTokens(value: string) {
  return Math.ceil(value.length / 4);
}

function removeOverlap(previous: string, next: string) {
  const left = previous.split(/\s+/);
  const right = next.split(/\s+/);
  const maxOverlap = Math.min(100, left.length, right.length);

  for (let count = maxOverlap; count >= 12; count -= 1) {
    const suffix = left.slice(-count).join(" ").toLocaleLowerCase();
    const prefix = right.slice(0, count).join(" ").toLocaleLowerCase();
    if (suffix === prefix) return right.slice(count).join(" ");
  }

  return next;
}

function groupConsecutiveChunks(chunks: RetrievedChunk[]) {
  const ordered = [...chunks].sort(
    (left, right) =>
      left.documentId.localeCompare(right.documentId) ||
      left.chunkIndex - right.chunkIndex,
  );
  const groups: ContextGroup[] = [];

  for (const chunk of ordered) {
    const current = groups.at(-1);
    if (
      current &&
      current.documentId === chunk.documentId &&
      chunk.chunkIndex === current.chunks.at(-1)!.chunkIndex + 1
    ) {
      current.text += `\n${removeOverlap(current.text, chunk.textContent)}`;
      current.chunks.push(chunk);
      current.score = Math.max(current.score, chunk.rrfScore);
      current.similarity = Math.max(current.similarity, chunk.vectorSimilarity);
      continue;
    }

    groups.push({
      documentId: chunk.documentId,
      documentName: chunk.documentName,
      chunks: [chunk],
      text: chunk.textContent,
      score: chunk.rrfScore,
      similarity: chunk.vectorSimilarity,
    });
  }

  return groups.sort(
    (left, right) => right.score - left.score || right.similarity - left.similarity,
  );
}

export async function retrieveDocumentChunks({
  query,
  userId,
  documentIds,
  tags,
}: {
  query: string;
  userId: string;
  documentIds?: string[];
  tags?: string[];
}): Promise<RetrievedChunk[]> {
  const embeddingProvider = await getEmbeddingProvider();
  const [queryEmbedding] = await embeddingProvider.embed([query]);
  if (!queryEmbedding) throw new Error("The query could not be vectorized.");

  const configuredThreshold = numeric(
    process.env.RAG_MATCH_THRESHOLD,
    DEFAULT_MATCH_THRESHOLD,
  );
  const matchCount = positiveInteger(
    process.env.RAG_MATCH_COUNT,
    DEFAULT_MATCH_COUNT,
  );
  const search = async (threshold: number) => {
    const { data, error } = await supabaseAdmin.rpc("match_documents", {
      p_query_embedding: queryEmbedding,
      p_query_text: query,
      p_user_id: userId,
      p_match_threshold: threshold,
      p_match_count: matchCount,
      p_document_ids: documentIds?.length ? documentIds : null,
      p_tags: tags?.length ? tags : null,
      p_rrf_k: 60,
    });

    if (error) {
      throw new Error("Hybrid document retrieval failed.", { cause: error });
    }
    return (data ?? []) as MatchDocumentsRow[];
  };

  let rows = await search(configuredThreshold);

  // Broad questions such as "summarize this document" can be semantically
  // distant from every individual chunk. An explicit source selection is a
  // strong relevance signal, so fall back to its best-ranked chunks.
  if (
    rows.length === 0 &&
    configuredThreshold > 0 &&
    Boolean(documentIds?.length || tags?.length)
  ) {
    rows = await search(0);
  }

  return rows.map((row) => ({
    chunkId: row.chunk_id,
    documentId: row.document_id,
    documentName: row.document_name,
    chunkIndex: row.chunk_index,
    pageNumber: row.page_number,
    textContent: row.text_content,
    vectorSimilarity: row.vector_similarity,
    keywordRank: row.keyword_rank,
    rrfScore: row.rrf_score,
  }));
}

export function buildContext(chunks: RetrievedChunk[]): BuiltContext {
  const maxTokens = positiveInteger(
    process.env.RAG_MAX_CONTEXT_TOKENS,
    DEFAULT_CONTEXT_TOKENS,
  );
  const groups = groupConsecutiveChunks(chunks);
  const sections: string[] = [];
  const sources: RagSource[] = [];
  let usedTokens = 0;

  for (const group of groups) {
    const sourceNumber = sources.length + 1;
    const first = group.chunks[0];
    const last = group.chunks.at(-1)!;
    const pageStart = first.pageNumber;
    const pageEnd = last.pageNumber;
    const metadata = [
      `Document: ${group.documentName}`,
      pageStart
        ? `Pages: ${pageStart}${pageEnd && pageEnd !== pageStart ? `-${pageEnd}` : ""}`
        : null,
      `Chunks: ${first.chunkIndex}-${last.chunkIndex}`,
    ]
      .filter(Boolean)
      .join("\n");
    const wrapperTokens = estimateTokens(metadata) + 20;
    const remainingTokens = maxTokens - usedTokens - wrapperTokens;
    if (remainingTokens < 80) break;

    const maxCharacters = remainingTokens * 4;
    const content =
      group.text.length > maxCharacters
        ? `${group.text.slice(0, maxCharacters).trimEnd()}\n[Context trimmed]`
        : group.text;
    const section = `[SOURCE S${sourceNumber} BEGIN]\n${metadata}\n\n${content}\n[SOURCE S${sourceNumber} END]`;
    const sectionTokens = estimateTokens(section);
    sections.push(section);
    usedTokens += sectionTokens;

    const source: RagSource = {
      id: `S${sourceNumber}`,
      chunkIds: group.chunks.map((chunk) => chunk.chunkId),
      documentId: group.documentId,
      documentName: group.documentName,
      pageStart,
      pageEnd,
      chunkStart: first.chunkIndex,
      chunkEnd: last.chunkIndex,
      similarity: group.similarity,
      score: group.score,
      excerpt: buildEvidenceExcerpt([group.text]),
    };
    sources.push(source);

    if (group.text.length > maxCharacters) break;
  }

  return {
    text: sections.join("\n\n"),
    sources,
    estimatedTokens: usedTokens,
  };
}
