"use server";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { requireAppUser } from "@/lib/auth/require-app-user";
import type {
  ExpenseCategory,
  ExpenseDashboardData,
  ExpenseDashboardEntry,
} from "@/lib/expenses/types";
import { supabaseAdmin } from "@/lib/supabase/admin";

type ExpenseRow = {
  id: string;
  documentId: string | null;
  extractionId: string | null;
  vendor: string;
  amount: string | number;
  currency: string;
  date: string;
  category: ExpenseCategory;
  description: string | null;
  confidence: number | null;
  sourceText: string | null;
  createdAt: string;
};

type ExtractionField = {
  pageNumber?: unknown;
  evidenceText?: unknown;
};

function evidencePage(value: unknown) {
  if (!Array.isArray(value)) return null;
  for (const field of value as ExtractionField[]) {
    if (
      typeof field.pageNumber === "number" &&
      Number.isSafeInteger(field.pageNumber) &&
      field.pageNumber > 0 &&
      typeof field.evidenceText === "string" &&
      field.evidenceText.trim()
    ) {
      return field.pageNumber;
    }
  }
  return null;
}

export async function getExpenseDashboardData(): Promise<ExpenseDashboardData> {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in?redirect_url=/workspace/expenses");
  }

  const appUser = await requireAppUser(userId);
  const [entriesResult, userResult] = await Promise.all([
    supabaseAdmin
      .from("expense_entries")
      .select(
        "id, documentId, extractionId, vendor, amount, currency, date, category, description, confidence, sourceText, createdAt",
      )
      .eq("userId", appUser.id)
      .order("date", { ascending: false })
      .limit(5_000),
    supabaseAdmin
      .from("users")
      .select("currency")
      .eq("id", appUser.id)
      .single(),
  ]);

  if (entriesResult.error || userResult.error) {
    throw new Error("Could not load the expense dashboard.", {
      cause: entriesResult.error ?? userResult.error,
    });
  }

  const rows = (entriesResult.data ?? []) as ExpenseRow[];
  const extractionIds = rows
    .map((row) => row.extractionId)
    .filter((id): id is string => Boolean(id));
  const pagesByExtraction = new Map<string, number | null>();

  if (extractionIds.length > 0) {
    const { data, error } = await supabaseAdmin
      .from("document_extractions")
      .select("id, fields")
      .in("id", extractionIds);
    if (error) {
      throw new Error("Could not load expense evidence.", { cause: error });
    }
    for (const extraction of data ?? []) {
      pagesByExtraction.set(
        String(extraction.id),
        evidencePage(extraction.fields),
      );
    }
  }

  const entries: ExpenseDashboardEntry[] = rows.map((row) => ({
    id: row.id,
    documentId: row.documentId,
    extractionId: row.extractionId,
    evidencePage: row.extractionId
      ? pagesByExtraction.get(row.extractionId) ?? null
      : null,
    vendor: row.vendor,
    amount: Number(row.amount),
    currency: row.currency.toUpperCase(),
    date: row.date,
    category: row.category,
    description: row.description,
    confidence: row.confidence,
    sourceText: row.sourceText,
    createdAt: row.createdAt,
  }));

  return {
    entries,
    defaultCurrency:
      typeof userResult.data.currency === "string"
        ? userResult.data.currency.toUpperCase()
        : "ETB",
  };
}
