import type { Metadata } from "next";
import { defaultSummaryModel, summaryModels } from "@/lib/ai/models";
import { DocumentDetailShell } from "./_components/document-detail-shell";
import { getDocumentDetail } from "./actions";

export const metadata: Metadata = {
  title: "Document details | NexusOps",
  description: "Review, summarize, and export an uploaded document.",
};

export default async function DocumentPage({
  params,
  searchParams,
}: PageProps<"/workspace/documents/[documentId]">) {
  const { documentId } = await params;
  const { page } = await searchParams;
  const parsedPage = Number.parseInt(
    Array.isArray(page) ? page[0] ?? "" : page ?? "",
    10,
  );
  const citedPage =
    Number.isSafeInteger(parsedPage) && parsedPage > 0 ? parsedPage : null;
  const document = await getDocumentDetail(documentId);

  return (
    <DocumentDetailShell
      initialDocument={document}
      models={summaryModels}
      defaultModel={defaultSummaryModel}
      citedPage={citedPage}
    />
  );
}
