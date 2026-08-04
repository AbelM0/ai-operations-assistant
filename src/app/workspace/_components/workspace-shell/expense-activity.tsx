"use client";

import { ArrowRight, Receipt } from "@phosphor-icons/react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import type { WorkspaceExpense } from "./types";
import { formatDate } from "./utils";

function formatMoney(amount: number, currency: string, locale: string) {
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString(locale)}`;
  }
}

export function ExpenseActivity({
  expenses,
}: {
  expenses: WorkspaceExpense[];
}) {
  const { t, i18n } = useTranslation();
  const locale = i18n.resolvedLanguage === "am" ? "am-ET" : "en";

  return (
    <section className="overflow-hidden rounded-xl border border-white/10 bg-[#0B0B0D]">
      <header className="flex items-center justify-between gap-4 border-b border-white/8 px-5 py-5 sm:px-6">
        <div>
          <h2 className="text-lg font-semibold tracking-[-0.025em] text-white">
            {t("workspace.expenseActivity.title")}
          </h2>
          <p className="mt-1 text-sm text-[#71717A]">
            {t("workspace.expenseActivity.description")}
          </p>
        </div>
        <Link
          href="/workspace/expenses"
          className="inline-flex h-9 shrink-0 items-center gap-2 rounded-lg border border-white/10 px-3.5 text-xs font-semibold text-[#D4D4D8] transition-colors hover:border-[#2DD4BF]/35 hover:bg-[#2DD4BF]/8 hover:text-white"
        >
          {t("workspace.expenseActivity.viewDashboard")}
          <ArrowRight className="h-3.5 w-3.5" weight="bold" />
        </Link>
      </header>

      {expenses.length > 0 ? (
        <div className="divide-y divide-white/7">
          {expenses.map((expense) => (
            <div
              key={expense.id}
              className="grid gap-3 px-5 py-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:px-6"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#2DD4BF]/8 text-[#5EEAD4]">
                  <Receipt className="h-4 w-4" weight="duotone" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-[#E4E4E7]">
                    {expense.vendor}
                  </p>
                  <p className="mt-1 text-[10px] text-[#71717A]">
                    {t(
                      `expenses.categories.${expense.category.toLowerCase()}`,
                    )}{" "}
                    · {formatDate(expense.date, locale)}
                  </p>
                </div>
              </div>
              <p className="font-mono text-xs tabular-nums text-white">
                {formatMoney(expense.amount, expense.currency, locale)}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="px-6 py-9 text-center">
          <Receipt className="mx-auto h-5 w-5 text-[#3F3F46]" />
          <p className="mt-3 text-xs leading-5 text-[#71717A]">
            {t("workspace.expenseActivity.empty")}
          </p>
        </div>
      )}
    </section>
  );
}
