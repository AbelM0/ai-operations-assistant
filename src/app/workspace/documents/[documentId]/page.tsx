import type { Metadata } from "next";
import { defaultSummaryModel, summaryModels } from "@/lib/ai/models";
import { DocumentDetailShell } from "./_components/document-detail-shell";
import { getDocumentDetail } from "./actions";

export const metadata: Metadata = {
  title: "Document details | NexusOps",
  description: "Review, summarize, and export an uploaded document.",
};

export default async function DocumentPage({ params }: PageProps<"/workspace/documents/[documentId]">) {
  const { documentId } = await params;
  const document = await getDocumentDetail(documentId);

  return (
    <DocumentDetailShell
      initialDocument={document}
      models={summaryModels}
      defaultModel={defaultSummaryModel}
    />
  );
}
