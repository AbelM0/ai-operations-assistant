import "server-only";

import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { requireAppUser } from "@/lib/auth/require-app-user";
import type { WorkspaceDocument } from "@/lib/documents/types";
import { attachExtractionSummaries } from "@/lib/documents/extraction-data";
import type { ConversationSummary } from "@/lib/rag/types";
import { supabaseAdmin } from "@/lib/supabase/admin";
import type {
  WorkspaceExpense,
  WorkspaceOverviewData,
} from "./_components/workspace-shell/types";

export async function getWorkspaceOverview(): Promise<WorkspaceOverviewData> {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in?redirect_url=/workspace");
  }

  const [user, appUser] = await Promise.all([
    currentUser(),
    requireAppUser(userId),
  ]);

  const [
    documentsResult,
    conversationsResult,
    expensesResult,
    expenseAttentionResult,
  ] = await Promise.all([
    supabaseAdmin
      .from("documents")
      .select(
        "id, originalName, mimeType, sizeBytes, status, errorMessage, createdAt",
      )
      .eq("userId", appUser.id)
      .order("createdAt", { ascending: false }),
    supabaseAdmin
      .from("conversations")
      .select("id, title, lastMessageAt, createdAt", { count: "exact" })
      .eq("userId", appUser.id)
      .eq("archived", false)
      .order("lastMessageAt", { ascending: false, nullsFirst: false })
      .limit(4),
    supabaseAdmin
      .from("expense_entries")
      .select("id, documentId, vendor, amount, currency, date, category", {
        count: "exact",
      })
      .eq("userId", appUser.id)
      .order("createdAt", { ascending: false })
      .limit(4),
    supabaseAdmin
      .from("expense_entries")
      .select("id", { count: "exact", head: true })
      .eq("userId", appUser.id)
      .or("documentId.is.null,category.eq.OTHER,confidence.lt.0.78"),
  ]);

  if (
    documentsResult.error ||
    conversationsResult.error ||
    expensesResult.error ||
    expenseAttentionResult.error
  ) {
    throw new Error("Could not load the workspace dashboard.", {
      cause:
        documentsResult.error ??
        conversationsResult.error ??
        expensesResult.error ??
        expenseAttentionResult.error,
    });
  }

  const documents = await attachExtractionSummaries(
    (documentsResult.data ?? []) as Omit<WorkspaceDocument, "extraction">[],
  );

  return {
    firstName: user?.firstName || user?.username || "there",
    initialDocuments: documents,
    initialConversations: (conversationsResult.data ??
      []) as ConversationSummary[],
    conversationCount: conversationsResult.count ?? 0,
    recentExpenses: (expensesResult.data ?? []).map((expense) => ({
      ...expense,
      amount: Number(expense.amount),
      currency: String(expense.currency).toUpperCase(),
    })) as WorkspaceExpense[],
    expenseCount: expensesResult.count ?? 0,
    expenseAttentionCount: expenseAttentionResult.count ?? 0,
  };
}
