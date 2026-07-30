import type { WorkspaceDocument } from "@/lib/documents/types";
import type { UploadCallbacks } from "./types";

export async function startDocumentProcessing(documentId: string) {
  const response = await fetch(`/api/documents/${documentId}`, {
    method: "POST",
  });

  if (response.ok || response.status === 409) {
    return;
  }

  const payload = (await response.json().catch(() => ({}))) as {
    error?: string;
  };

  throw new Error(payload.error || "Document processing did not start.");
}

export function uploadDocument(
  file: File,
  {
    onProgress,
    onSuccess,
    onFailure,
    onInterrupted,
  }: UploadCallbacks,
) {
  const request = new XMLHttpRequest();
  const body = new FormData();
  body.append("file", file);

  request.open("POST", "/api/documents");
  request.responseType = "json";
  request.upload.onprogress = (event) => {
    if (event.lengthComputable) {
      onProgress(
        Math.min(95, Math.round((event.loaded / event.total) * 95)),
      );
    }
  };
  request.onload = () => {
    if (
      request.status >= 200 &&
      request.status < 300 &&
      request.response?.document
    ) {
      onSuccess(request.response.document as WorkspaceDocument);
      return;
    }

    onFailure(request.response?.error);
  };
  request.onerror = onInterrupted;
  request.send(body);

  return () => request.abort();
}
