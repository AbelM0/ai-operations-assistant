import "server-only";

import { supabaseAdmin } from "@/lib/supabase/admin";

const STALE_PROCESSING_MS = 6 * 60 * 1000;
const ACTIVE_PROCESSING_STATUSES = [
  "OCR_PROCESSING",
  "OCR_COMPLETED",
  "CHUNKING",
  "EMBEDDING",
] as const;

export async function failStaleDocumentProcessing({
  userId,
  documentId,
}: {
  userId: string;
  documentId?: string;
}) {
  const staleBefore = new Date(Date.now() - STALE_PROCESSING_MS).toISOString();
  let query = supabaseAdmin
    .from("documents")
    .update({
      status: "FAILED",
      errorMessage:
        "Processing was interrupted before it completed. Restart processing to try again.",
      processingCompletedAt: new Date().toISOString(),
    })
    .eq("userId", userId)
    .in("status", [...ACTIVE_PROCESSING_STATUSES])
    .lt("processingStartedAt", staleBefore);

  if (documentId) query = query.eq("id", documentId);

  const { error } = await query;
  if (error) {
    console.error("Could not recover stale document processing", error);
  }
}
