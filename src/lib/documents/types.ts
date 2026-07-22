export type WorkspaceDocument = {
  id: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  status: string;
  errorMessage?: string | null;
  createdAt: string;
};
