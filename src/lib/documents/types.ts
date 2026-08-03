export const documentTypes = [
  "INVOICE",
  "RECEIPT",
  "CONTRACT",
  "OTHER",
] as const;

export type DocumentType = (typeof documentTypes)[number];

export const extractionFieldKeys = [
  "vendor",
  "documentNumber",
  "date",
  "dueDate",
  "currency",
  "subtotal",
  "tax",
  "total",
  "paymentMethod",
  "category",
  "vendorTaxId",
] as const;

export type ExtractionFieldKey = (typeof extractionFieldKeys)[number];
export type ExtractionFieldStatus =
  | "suggested"
  | "confirmed"
  | "corrected"
  | "missing"
  | "conflicting";

export type ExtractedField = {
  key: ExtractionFieldKey;
  value: string | null;
  normalizedValue: string | null;
  confidence: number;
  status: ExtractionFieldStatus;
  pageNumber: number | null;
  chunkId: string | null;
  evidenceText: string | null;
};

export type ExtractionReviewStatus =
  | "PROCESSING"
  | "SUGGESTED"
  | "NEEDS_REVIEW"
  | "CONFIRMED"
  | "FAILED";

export type DocumentExtraction = {
  id: string;
  documentId: string;
  documentType: DocumentType;
  classificationConfidence: number;
  schemaVersion: string;
  fields: ExtractedField[];
  reviewStatus: ExtractionReviewStatus;
  provider: string | null;
  model: string | null;
  errorMessage: string | null;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
  expenseEntryId: string | null;
};

export type DuplicateExpenseCandidate = {
  id: string;
  documentId: string | null;
  vendor: string;
  amount: string;
  currency: string;
  date: string;
};

export type WorkspaceDocument = {
  id: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  status: string;
  errorMessage?: string | null;
  createdAt: string;
  extraction?: Pick<
    DocumentExtraction,
    | "documentType"
    | "classificationConfidence"
    | "reviewStatus"
    | "fields"
  > | null;
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
  extraction: DocumentExtraction | null;
  duplicateExpenses: DuplicateExpenseCandidate[];
};
