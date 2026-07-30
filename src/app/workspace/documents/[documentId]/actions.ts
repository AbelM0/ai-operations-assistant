import "server-only";

import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import { requireAppUser } from "@/lib/auth/require-app-user";
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

  const { data: summaries, error: summaryError } = await supabaseAdmin
    .from("document_summaries")
    .select("id, summary, language, provider, model, createdAt")
    .eq("documentId", documentId)
    .order("createdAt", { ascending: false });

  if (summaryError) {
    throw new Error("Could not load document summaries.", {
      cause: summaryError,
    });
  }

  return {
    ...document,
    summaries: summaries ?? [],
  } as WorkspaceDocumentDetail;
}
