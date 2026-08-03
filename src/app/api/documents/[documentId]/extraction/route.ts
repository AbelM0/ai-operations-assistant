import { NextResponse } from "next/server";
import { requireAppUser } from "@/lib/auth/require-app-user";
import {
  fieldValue,
  findDuplicateExpenses,
  loadDocumentExtraction,
} from "@/lib/documents/extraction-data";
import { normalizeExtractionDate } from "@/lib/documents/extraction-normalization";
import { extractDocumentOperations } from "@/lib/documents/extract-operations";
import {
  documentTypes,
  extractionFieldKeys,
  type DocumentType,
  type ExtractedField,
  type ExtractionFieldKey,
} from "@/lib/documents/types";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const maxDuration = 300;

const categories = new Set([
  "OFFICE",
  "TRANSPORT",
  "UTILITIES",
  "FUEL",
  "RENT",
  "SALARY",
  "FOOD",
  "OTHER",
]);

function responseError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

async function ownedDocument(documentId: string, userId: string) {
  const { data, error } = await supabaseAdmin
    .from("documents")
    .select("id, status, originalName")
    .eq("id", documentId)
    .eq("userId", userId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

function normalizedValue(key: ExtractionFieldKey, value: string | null) {
  if (!value) return null;
  if (["subtotal", "tax", "total"].includes(key)) {
    const numeric = value.replace(/[^0-9.-]/g, "");
    return /^-?\d+(?:\.\d+)?$/.test(numeric) ? numeric : value;
  }
  if (key === "currency") return value.toUpperCase().slice(0, 3);
  if (key === "category") {
    const category = value.toUpperCase();
    return categories.has(category) ? category : "OTHER";
  }
  if (key === "date" || key === "dueDate") {
    return normalizeExtractionDate(value);
  }
  return value;
}

function editableFields(value: unknown, existing: ExtractedField[]) {
  if (!Array.isArray(value)) return null;
  const updates = new Map<string, string | null>();
  for (const item of value) {
    if (!item || typeof item !== "object") continue;
    const key = "key" in item ? item.key : null;
    const rawValue = "value" in item ? item.value : null;
    if (
      typeof key !== "string" ||
      !extractionFieldKeys.includes(key as ExtractionFieldKey) ||
      (typeof rawValue !== "string" && rawValue !== null)
    ) {
      continue;
    }
    updates.set(
      key,
      typeof rawValue === "string" ? rawValue.trim().slice(0, 500) || null : null,
    );
  }

  return existing.map((field) => {
    if (!updates.has(field.key)) return field;
    const value = updates.get(field.key) ?? null;
    const changed = value !== field.value;
    return {
      ...field,
      value,
      normalizedValue: normalizedValue(field.key, value),
      confidence: changed ? 1 : field.confidence,
      status: value ? (changed ? "corrected" : field.status) : "missing",
      pageNumber: changed ? null : field.pageNumber,
      chunkId: changed ? null : field.chunkId,
      evidenceText: changed ? null : field.evidenceText,
    } satisfies ExtractedField;
  });
}

function missingCriticalFields(fields: ExtractedField[]) {
  const required: ExtractionFieldKey[] = ["vendor", "date", "currency", "total"];
  return required.filter((key) => !fieldValue(fields, key));
}

async function responsePayload(documentId: string, userId: string) {
  const extraction = await loadDocumentExtraction(documentId);
  const duplicateExpenses = await findDuplicateExpenses(userId, extraction);
  return { extraction, duplicateExpenses };
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ documentId: string }> },
) {
  const appUser = await requireAppUser();
  if (!appUser) return responseError("Authentication required.", 401);
  const { documentId } = await params;
  const document = await ownedDocument(documentId, appUser.id);
  if (!document) return responseError("Document not found.", 404);
  if (document.status !== "READY") {
    return responseError("The document must finish processing first.", 409);
  }

  const body = (await request.json().catch(() => ({}))) as {
    documentType?: unknown;
  };
  const forcedType =
    typeof body.documentType === "string" &&
    documentTypes.includes(body.documentType as DocumentType)
      ? (body.documentType as DocumentType)
      : undefined;

  try {
    await extractDocumentOperations(documentId, { forcedType });
    await supabaseAdmin.from("audit_logs").insert({
      userId: appUser.id,
      action: forcedType ? "document_type_overridden" : "document_reanalyzed",
      resource: "document",
      resourceId: documentId,
      metadata: forcedType ? { documentType: forcedType } : null,
    });
    return NextResponse.json(await responsePayload(documentId, appUser.id));
  } catch (error) {
    console.error(`Could not analyze document ${documentId}`, error);
    return responseError("The structured details could not be prepared.", 500);
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ documentId: string }> },
) {
  const appUser = await requireAppUser();
  if (!appUser) return responseError("Authentication required.", 401);
  const { documentId } = await params;
  const document = await ownedDocument(documentId, appUser.id);
  if (!document) return responseError("Document not found.", 404);

  const extraction = await loadDocumentExtraction(documentId);
  if (!extraction || extraction.userId !== appUser.id) {
    return responseError("Structured details are not available.", 404);
  }
  const body = (await request.json().catch(() => ({}))) as {
    action?: unknown;
    fields?: unknown;
    allowDuplicate?: unknown;
  };
  const action = typeof body.action === "string" ? body.action : "";

  if (action === "save" || action === "confirm") {
    const fields = editableFields(body.fields, extraction.fields);
    if (!fields) return responseError("The field changes are invalid.", 400);
    const missing = missingCriticalFields(fields);
    if (action === "confirm" && missing.length > 0) {
      return NextResponse.json(
        { error: "Complete the required fields before confirming.", missingFields: missing },
        { status: 422 },
      );
    }

    const confirmedFields = fields.map((field) => ({
      ...field,
      status:
        action === "confirm" && field.value
          ? field.status === "corrected"
            ? "corrected"
            : "confirmed"
          : field.status,
    })) as ExtractedField[];
    const reviewStatus = action === "confirm" ? "CONFIRMED" : "NEEDS_REVIEW";
    const { error } = await supabaseAdmin
      .from("document_extractions")
      .update({
        fields: confirmedFields,
        reviewStatus,
        reviewedAt: action === "confirm" ? new Date().toISOString() : null,
        updatedAt: new Date().toISOString(),
      })
      .eq("id", extraction.id)
      .eq("userId", appUser.id);
    if (error) return responseError("The structured details could not be saved.", 500);

    await supabaseAdmin.from("audit_logs").insert({
      userId: appUser.id,
      action: action === "confirm" ? "document_extraction_confirmed" : "document_extraction_saved",
      resource: "document_extraction",
      resourceId: extraction.id,
      metadata: { documentId },
    });
    return NextResponse.json(await responsePayload(documentId, appUser.id));
  }

  if (action === "promote") {
    if (extraction.reviewStatus !== "CONFIRMED") {
      return responseError("Confirm the extracted details before adding an expense.", 409);
    }
    if (
      extraction.documentType !== "INVOICE" &&
      extraction.documentType !== "RECEIPT"
    ) {
      return responseError("Only invoices and receipts can be added to expenses.", 409);
    }

    const duplicates = await findDuplicateExpenses(appUser.id, extraction);
    if (duplicates.length > 0 && body.allowDuplicate !== true) {
      return NextResponse.json(
        { error: "A matching expense already exists.", duplicateExpenses: duplicates },
        { status: 409 },
      );
    }

    const vendor = fieldValue(extraction.fields, "vendor");
    const total = fieldValue(extraction.fields, "total");
    const currency = fieldValue(extraction.fields, "currency");
    const date = fieldValue(extraction.fields, "date");
    if (!vendor || !total || !currency || !/^\d+(?:\.\d+)?$/.test(total)) {
      return responseError("The confirmed expense fields are incomplete.", 422);
    }
    if (!date) {
      return responseError("The confirmed expense date is invalid.", 422);
    }
    const parsedDate = new Date(`${date}T00:00:00.000Z`);
    if (Number.isNaN(parsedDate.getTime())) {
      return responseError("The confirmed expense date is invalid.", 422);
    }
    const categoryValue = fieldValue(extraction.fields, "category")?.toUpperCase();
    const category = categoryValue && categories.has(categoryValue) ? categoryValue : "OTHER";
    const confidenceValues = extraction.fields
      .filter((field) => field.value)
      .map((field) => field.confidence);
    const confidence = confidenceValues.length
      ? confidenceValues.reduce((sum, value) => sum + value, 0) /
        confidenceValues.length
      : null;
    const documentNumber = fieldValue(extraction.fields, "documentNumber");
    const { error } = await supabaseAdmin.from("expense_entries").upsert(
      {
        userId: appUser.id,
        documentId,
        extractionId: extraction.id,
        vendor,
        amount: total,
        currency: currency.toUpperCase(),
        date: parsedDate.toISOString(),
        category,
        description: documentNumber
          ? `${extraction.documentType}: ${documentNumber}`
          : extraction.documentType,
        confidence,
        sourceText: extraction.fields
          .map((field) => field.evidenceText)
          .filter(Boolean)
          .join("\n\n")
          .slice(0, 4_000) || null,
      },
      { onConflict: "extractionId" },
    );
    if (error) return responseError("The expense could not be saved.", 500);

    await supabaseAdmin.from("audit_logs").insert({
      userId: appUser.id,
      action: "document_promoted_to_expense",
      resource: "document_extraction",
      resourceId: extraction.id,
      metadata: { documentId, allowDuplicate: body.allowDuplicate === true },
    });
    return NextResponse.json(await responsePayload(documentId, appUser.id));
  }

  return responseError("Choose a supported extraction action.", 400);
}
