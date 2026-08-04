import type { WorkspaceDocument } from "@/lib/documents/types";
import type { ExpenseCategory } from "@/lib/expenses/types";
import type { ConversationSummary } from "@/lib/rag/types";

export type WorkspaceExpense = {
  id: string;
  documentId: string | null;
  vendor: string;
  amount: number;
  currency: string;
  date: string;
  category: ExpenseCategory;
};

export type WorkspaceShellProps = {
  firstName: string;
  initialDocuments: WorkspaceDocument[];
  initialConversations: ConversationSummary[];
  conversationCount: number;
  recentExpenses: WorkspaceExpense[];
  expenseCount: number;
  expenseAttentionCount: number;
};

export type WorkspaceOverviewData = WorkspaceShellProps;

export type DocumentUploadedHandler = (document: WorkspaceDocument) => void;
