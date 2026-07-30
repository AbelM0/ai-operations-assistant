import type { Metadata } from "next";
import { DocumentsShell } from "./_components/documents-shell";
import { getWorkspaceDocuments } from "./actions";

export const metadata: Metadata = {
  title: "Documents | NexusOps",
  description: "View, upload, and download documents in your private NexusOps workspace.",
};

export default async function DocumentsPage() {
  const documents = await getWorkspaceDocuments();

  return <DocumentsShell initialDocuments={documents} />;
}
