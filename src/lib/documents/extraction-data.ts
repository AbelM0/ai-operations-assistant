import "server-only";

import { supabaseAdmin } from "@/lib/supabase/admin";
import { normalizeExtractionDate } from "./extraction-normalization";
import type {
  DocumentExtraction,
  DuplicateExpenseCandidate,
  ExtractedField,
  ExtractionFieldKey,
  WorkspaceDocument,
} from "./types";

type ExtractionRow = Omit<DocumentExtraction, "expenseEntryId"> & {
  userId: string;
};

export function fieldValue(
  fields: ExtractedField[],
  key: ExtractionFieldKey,
) {
  const field = fields.find((candidate) => candidate.key === key);
  if (key === "date" || key === "dueDate") {
    return (
      normalizeExtractionDate(field?.normalizedValue) ??
      normalizeExtractionDate(field?.value)
    );
  }
  return field?.normalizedValue || field?.value || null;
}

export async function loadDocumentExtraction(documentId: string) {
  const { data: extraction, error } = await supabaseAdmin
    .from("document_extractions")
    .select(
      "id, documentId, userId, documentType, classificationConfidence, schemaVersion, fields, reviewStatus, provider, model, errorMessage, reviewedAt, createdAt, updatedAt",
    )
    .eq("documentId", documentId)
    .maybeSingle();
  if (error) throw error;
  if (!extraction) return null;

  const { data: expense, error: expenseError } = await supabaseAdmin
    .from("expense_entries")
    .select("id")
    .eq("extractionId", extraction.id)
    .maybeSingle();
  if (expenseError) throw expenseError;

  return {
    ...(extraction as ExtractionRow),
    fields: Array.isArray(extraction.fields)
      ? (extraction.fields as unknown as ExtractedField[])
      : [],
    expenseEntryId: expense?.id ? String(expense.id) : null,
  } satisfies DocumentExtraction & { userId: string };
}

export async function attachExtractionSummaries<
  T extends Omit<WorkspaceDocument, "extraction">,
>(documents: T[]): Promise<Array<T & Pick<WorkspaceDocument, "extraction">>> {
  if (documents.length === 0) return [];

  const { data, error } = await supabaseAdmin
    .from("document_extractions")
    .select(
      "documentId, documentType, classificationConfidence, reviewStatus, fields",
    )
    .in(
      "documentId",
      documents.map((document) => document.id),
    );
  if (error) throw error;

  const byDocument = new Map(
    (data ?? []).map((extraction) => [
      String(extraction.documentId),
      {
        documentType: extraction.documentType,
        classificationConfidence: extraction.classificationConfidence,
        reviewStatus: extraction.reviewStatus,
        fields: Array.isArray(extraction.fields)
          ? (extraction.fields as unknown as ExtractedField[])
          : [],
      },
    ]),
  );

  return documents.map((document) => ({
    ...document,
    extraction: byDocument.get(document.id) ?? null,
  })) as Array<T & Pick<WorkspaceDocument, "extraction">>;
}

function normalizedVendor(value: string) {
  return value.toLocaleLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();
}

export async function findDuplicateExpenses(
  userId: string,
  extraction: DocumentExtraction | null,
): Promise<DuplicateExpenseCandidate[]> {
  if (
    !extraction ||
    (extraction.documentType !== "INVOICE" &&
      extraction.documentType !== "RECEIPT")
  ) {
    return [];
  }

  const vendor = fieldValue(extraction.fields, "vendor");
  const total = fieldValue(extraction.fields, "total");
  const currency = fieldValue(extraction.fields, "currency");
  const date = fieldValue(extraction.fields, "date");
  if (!vendor || !total || !currency || !date) return [];

  const parsedDate = new Date(`${date}T00:00:00.000Z`);
  if (Number.isNaN(parsedDate.getTime())) return [];
  const nextDate = new Date(parsedDate);
  nextDate.setUTCDate(nextDate.getUTCDate() + 1);

  const { data, error } = await supabaseAdmin
    .from("expense_entries")
    .select("id, documentId, vendor, amount, currency, date")
    .eq("userId", userId)
    .eq("amount", total)
    .eq("currency", currency.toUpperCase())
    .gte("date", parsedDate.toISOString())
    .lt("date", nextDate.toISOString())
    .limit(5);
  if (error) throw error;

  const targetVendor = normalizedVendor(vendor);
  return (data ?? [])
    .filter((candidate) => String(candidate.id) !== extraction.expenseEntryId)
    .filter((candidate) => normalizedVendor(String(candidate.vendor)) === targetVendor)
    .map((candidate) => ({
      id: String(candidate.id),
      documentId: candidate.documentId ? String(candidate.documentId) : null,
      vendor: String(candidate.vendor),
      amount: String(candidate.amount),
      currency: String(candidate.currency),
      date: String(candidate.date),
    }));
}
