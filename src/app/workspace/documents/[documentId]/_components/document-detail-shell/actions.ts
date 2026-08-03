import type { WorkspaceDocumentDetail } from "@/lib/documents/types";
import type {
  DocumentExtraction,
  DocumentType,
  DuplicateExpenseCandidate,
  ExtractedField,
} from "@/lib/documents/types";
import type { RetryDocumentResponse } from "./types";

export async function fetchDocumentDetail(
  documentId: string,
): Promise<WorkspaceDocumentDetail> {
  const response = await fetch(`/api/documents/${documentId}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Could not refresh the document.");
  }

  const payload = (await response.json()) as {
    document: WorkspaceDocumentDetail;
  };
  return payload.document;
}

export async function restartDocumentProcessing(
  documentId: string,
): Promise<RetryDocumentResponse> {
  const response = await fetch(`/api/documents/${documentId}`, {
    method: "POST",
  });
  const payload = (await response.json().catch(() => ({}))) as
    RetryDocumentResponse;

  if (!response.ok) {
    const error = new Error(
      payload.error || "Document processing could not be restarted.",
    );
    Object.assign(error, { document: payload.document });
    throw error;
  }

  return payload;
}

export async function removeDocument(documentId: string) {
  const response = await fetch(`/api/documents/${documentId}`, {
    method: "DELETE",
  });
  const payload = (await response.json().catch(() => ({}))) as {
    error?: string;
  };

  if (!response.ok) {
    throw new Error(payload.error || "The document could not be deleted.");
  }
}

type ExtractionResponse = {
  extraction: DocumentExtraction;
  duplicateExpenses: DuplicateExpenseCandidate[];
  error?: string;
  missingFields?: string[];
};

async function extractionRequest(
  documentId: string,
  init: RequestInit,
): Promise<ExtractionResponse> {
  const response = await fetch(`/api/documents/${documentId}/extraction`, init);
  const payload = (await response.json().catch(() => ({}))) as ExtractionResponse;
  if (!response.ok) {
    const error = new Error(payload.error || "The structured details could not be updated.");
    Object.assign(error, payload);
    throw error;
  }
  return payload;
}

export function reanalyzeDocument(
  documentId: string,
  documentType?: DocumentType,
) {
  return extractionRequest(documentId, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ documentType }),
  });
}

export function updateDocumentExtraction(
  documentId: string,
  action: "save" | "confirm" | "promote",
  fields: ExtractedField[],
  allowDuplicate = false,
) {
  const body =
    action === "promote"
      ? { action, allowDuplicate }
      : { action, fields, allowDuplicate };

  return extractionRequest(documentId, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}
