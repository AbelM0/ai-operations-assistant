import { auth } from "@clerk/nextjs/server";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { DocumentDetailShell } from "@/components/workspace/document-detail-shell";
import { defaultSummaryModel, summaryModels } from "@/lib/ai/models";
import { requireAppUser } from "@/lib/auth/require-app-user";
import type { WorkspaceDocumentDetail } from "@/lib/documents/types";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const metadata: Metadata = {
  title: "Document details | NexusOps",
  description: "Review, summarize, and export an uploaded document.",
};

export default async function DocumentPage({ params }: PageProps<"/workspace/documents/[documentId]">) {
  const { userId } = await auth();
  const { documentId } = await params;
  if (!userId) redirect(`/sign-in?redirect_url=/workspace/documents/${documentId}`);

  const appUser = await requireAppUser(userId);

  const { data: document, error } = await supabaseAdmin
    .from("documents")
    .select("id, originalName, mimeType, sizeBytes, pageCount, status, errorMessage, parserUsed, processingCompletedAt, createdAt")
    .eq("id", documentId)
    .eq("userId", appUser.id)
    .maybeSingle();
  if (error) throw new Error("Could not load the document.", { cause: error });
  if (!document) notFound();

  const { data: summaries, error: summaryError } = await supabaseAdmin
    .from("document_summaries")
    .select("id, summary, language, provider, model, createdAt")
    .eq("documentId", documentId)
    .order("createdAt", { ascending: false });
  if (summaryError) throw new Error("Could not load document summaries.", { cause: summaryError });

  return (
    <DocumentDetailShell
      initialDocument={{ ...document, summaries: summaries ?? [] } as WorkspaceDocumentDetail}
      models={summaryModels}
      defaultModel={defaultSummaryModel}
    />
  );
}
