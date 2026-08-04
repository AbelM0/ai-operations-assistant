import type { Metadata } from "next";
import { ExpensesShell } from "./_components/expenses-shell";
import { getExpenseDashboardData } from "./actions";

export const metadata: Metadata = {
  title: "Expenses | NexusOps",
  description:
    "Monitor operational spend, investigate expense quality, and trace entries to source evidence.",
};

export default async function ExpensesPage() {
  const data = await getExpenseDashboardData();
  return <ExpensesShell initialData={data} />;
}
