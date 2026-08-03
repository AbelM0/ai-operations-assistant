import "server-only";

import { getEmbeddingProvider } from "@/lib/ai/embeddings";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { chunkPages } from "./chunk-text";
import { extractDocumentText } from "./extract-text";
import { extractDocumentOperations } from "./extract-operations";

const EMBEDDING_BATCH_SIZE = 12;

function errorMessage(error: unknown) {
  return (error instanceof Error ? error.message : "Document processing failed.").slice(
    0,
    500,
  );
}

export async function processDocument(documentId: string) {
  const startedAt = new Date();

  try {
    const { data: document, error: documentError } = await supabaseAdmin
      .from("documents")
      .update({
        status: "OCR_PROCESSING",
        errorMessage: null,
        processingStartedAt: startedAt.toISOString(),
        processingCompletedAt: null,
        processingDurationMs: null,
      })
      .eq("id", documentId)
      .in("status", ["UPLOADED", "FAILED"])
      .select("id, storagePath, mimeType")
      .maybeSingle();

    if (documentError) throw documentError;

    // Another worker already claimed this document, or it has completed.
    if (!document) return;

    const bucket = process.env.SUPABASE_STORAGE_BUCKET || "documents";
    const { data: file, error: downloadError } = await supabaseAdmin.storage
      .from(bucket)
      .download(document.storagePath);

    if (downloadError || !file) {
      throw downloadError || new Error("Stored document could not be downloaded.");
    }

    const extracted = await extractDocumentText(file, document.mimeType);
    const { error: extractionUpdateError } = await supabaseAdmin
      .from("documents")
      .update({
        status: "OCR_COMPLETED",
        pageCount: extracted.pageCount,
        parserUsed: extracted.parserUsed,
        ocrEngine: extracted.ocrEngine,
      })
      .eq("id", documentId);

    if (extractionUpdateError) throw extractionUpdateError;

    const { error: chunkingStatusError } = await supabaseAdmin
      .from("documents")
      .update({ status: "CHUNKING" })
      .eq("id", documentId);

    if (chunkingStatusError) throw chunkingStatusError;

    const chunks = chunkPages(extracted.pages);

    if (chunks.length === 0) {
      throw new Error("No text chunks could be created from the document.");
    }

    const { error: deleteError } = await supabaseAdmin
      .from("document_chunks")
      .delete()
      .eq("documentId", documentId);

    if (deleteError) throw deleteError;

    const { error: embeddingStatusError } = await supabaseAdmin
      .from("documents")
      .update({ status: "EMBEDDING" })
      .eq("id", documentId);

    if (embeddingStatusError) throw embeddingStatusError;

    const embeddingProvider = await getEmbeddingProvider();

    for (let offset = 0; offset < chunks.length; offset += EMBEDDING_BATCH_SIZE) {
      const batch = chunks.slice(offset, offset + EMBEDDING_BATCH_SIZE);
      const embeddings = await embeddingProvider.embed(
        batch.map((chunk) => chunk.textContent),
      );
      const { error: insertError } = await supabaseAdmin
        .from("document_chunks")
        .insert(
          batch.map((chunk, index) => ({
            documentId,
            chunkIndex: chunk.chunkIndex,
            pageNumber: chunk.pageNumber,
            tokenCount: chunk.tokenCount,
            textContent: chunk.textContent,
            embedding: embeddings[index],
          })),
        );

      if (insertError) throw insertError;
    }

    try {
      await extractDocumentOperations(documentId);
    } catch (extractionError) {
      // Structured extraction is additive. A document remains searchable even
      // when the operations card cannot be prepared.
      console.error(
        `Structured extraction failed for ${documentId}`,
        extractionError,
      );
    }

    const completedAt = new Date();
    const { error: readyError } = await supabaseAdmin
      .from("documents")
      .update({
        status: "READY",
        processingCompletedAt: completedAt.toISOString(),
        processingDurationMs: completedAt.getTime() - startedAt.getTime(),
      })
      .eq("id", documentId);

    if (readyError) throw readyError;
  } catch (error) {
    console.error(`Document processing failed for ${documentId}`, error);
    await supabaseAdmin.from("document_chunks").delete().eq("documentId", documentId);
    await supabaseAdmin
      .from("documents")
      .update({
        status: "FAILED",
        errorMessage: errorMessage(error),
        processingCompletedAt: new Date().toISOString(),
        processingDurationMs: Date.now() - startedAt.getTime(),
      })
      .eq("id", documentId);
  }
}
