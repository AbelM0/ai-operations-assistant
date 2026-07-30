import type { WorkspaceDocument } from "@/lib/documents/types";

export type DocumentUploadProps = {
  onUploaded: (document: WorkspaceDocument) => void;
  showHeader?: boolean;
};

export type UploadCallbacks = {
  onProgress: (progress: number) => void;
  onSuccess: (document: WorkspaceDocument) => void;
  onFailure: (message?: string) => void;
  onInterrupted: () => void;
};
