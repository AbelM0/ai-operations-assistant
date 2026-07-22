export type WorkspaceDocument = {
  id: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  status: string;
  errorMessage?: string | null;
  createdAt: string;
};

export type DocumentSummary = {
  id: string;
  summary: string;
  language: string;
  provider: string | null;
  model: string | null;
  createdAt: string;
};

export type WorkspaceDocumentDetail = WorkspaceDocument & {
  pageCount?: number | null;
  parserUsed?: string | null;
  processingCompletedAt?: string | null;
  summaries: DocumentSummary[];
};
