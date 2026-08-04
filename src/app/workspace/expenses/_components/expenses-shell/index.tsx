"use client";

import { useTranslation } from "react-i18next";
import { LanguageToggle } from "@/components/language-toggle";
import {
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { WorkspaceSidebar } from "@/components/workspace-sidebar";
import type { ExpenseDashboardData } from "@/lib/expenses/types";
import { ExpenseDashboard } from "./expense-dashboard";
import { ExpensesNav } from "./expenses-nav";

export function ExpensesShell({
  initialData,
}: {
  initialData: ExpenseDashboardData;
}) {
  const { t, i18n } = useTranslation();
  const locale = i18n.resolvedLanguage === "am" ? "am-ET" : "en-US";

  return (
    <>
      <WorkspaceSidebar>
        <ExpensesNav expenseCount={initialData.entries.length} />
      </WorkspaceSidebar>

      <SidebarInset className="min-h-dvh bg-[#050505]">
        <div className="nexus-page min-h-dvh bg-[#050505] text-white">
          <div className="nexus-workspace-grid pointer-events-none fixed inset-0 opacity-30" />

          <header className="sticky top-0 z-20 flex h-17 items-center justify-between border-b border-white/8 bg-[#050505]/88 px-4 backdrop-blur-xl sm:px-7 lg:px-10">
            <div className="flex items-center gap-3">
              <SidebarTrigger
                className="h-9 w-9 rounded-lg text-[#A1A1AA] hover:bg-white/5 hover:text-white focus-visible:ring-2 focus-visible:ring-[#5EEAD4]"
                aria-label={t("nav.openNavigation")}
              />
              <div>
                <p className="text-sm font-medium text-white">
                  {t("nav.expenses")}
                </p>
                <p className="hidden text-xs text-[#71717A] sm:block">
                  {t("expenses.headerDescription")}
                </p>
              </div>
            </div>
            <LanguageToggle />
          </header>

          <main className="relative mx-auto w-full max-w-[1480px] px-4 pb-16 pt-8 sm:px-7 sm:pt-10 lg:px-10 lg:pb-20">
            <ExpenseDashboard
              initialData={initialData}
              locale={locale}
            />
          </main>
        </div>
      </SidebarInset>
    </>
  );
}
