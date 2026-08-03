import "server-only";

import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import { requireAppUser } from "@/lib/auth/require-app-user";
import {
  findDuplicateExpenses,
  loadDocumentExtraction,
} from "@/lib/documents/extraction-data";
import type { WorkspaceDocumentDetail } from "@/lib/documents/types";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function getDocumentDetail(
  documentId: string,
): Promise<WorkspaceDocumentDetail> {
  const { userId } = await auth();

  if (!userId) {
    redirect(`/sign-in?redirect_url=/workspace/documents/${documentId}`);
  }

  const appUser = await requireAppUser(userId);
  const { data: document, error } = await supabaseAdmin
    .from("documents")
    .select(
      "id, originalName, mimeType, sizeBytes, pageCount, status, errorMessage, parserUsed, processingCompletedAt, createdAt",
    )
    .eq("id", documentId)
    .eq("userId", appUser.id)
    .maybeSingle();

  if (error) {
    throw new Error("Could not load the document.", { cause: error });
  }

  if (!document) {
    notFound();
  }

  const [summaryResult, extraction] = await Promise.all([
    supabaseAdmin
      .from("document_summaries")
      .select("id, summary, language, provider, model, createdAt")
      .eq("documentId", documentId)
      .order("createdAt", { ascending: false }),
    loadDocumentExtraction(documentId),
  ]);

  if (summaryResult.error) {
    throw new Error("Could not load document summaries.", {
      cause: summaryResult.error,
    });
  }

  const duplicateExpenses = await findDuplicateExpenses(appUser.id, extraction);

  return {
    ...document,
    summaries: summaryResult.data ?? [],
    extraction,
    duplicateExpenses,
  } as WorkspaceDocumentDetail;
}
