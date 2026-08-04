export const expenseCategories = [
  "OFFICE",
  "TRANSPORT",
  "UTILITIES",
  "FUEL",
  "RENT",
  "SALARY",
  "FOOD",
  "OTHER",
] as const;

export type ExpenseCategory = (typeof expenseCategories)[number];

export type ExpenseDashboardEntry = {
  id: string;
  documentId: string | null;
  extractionId: string | null;
  evidencePage: number | null;
  vendor: string;
  amount: number;
  currency: string;
  date: string;
  category: ExpenseCategory;
  description: string | null;
  confidence: number | null;
  sourceText: string | null;
  createdAt: string;
};

export type ExpenseDashboardData = {
  entries: ExpenseDashboardEntry[];
  defaultCurrency: string;
};
