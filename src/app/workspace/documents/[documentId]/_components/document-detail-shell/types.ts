import type { SummaryModelOption } from "@/lib/ai/models";
import type { WorkspaceDocumentDetail } from "@/lib/documents/types";

export type DocumentDetailShellProps = {
  initialDocument: WorkspaceDocumentDetail;
  models: SummaryModelOption[];
  defaultModel: string;
  citedPage: number | null;
};

export type RetryDocumentResponse = {
  document?: {
    status: string;
    errorMessage?: string | null;
  };
  error?: string;
};
