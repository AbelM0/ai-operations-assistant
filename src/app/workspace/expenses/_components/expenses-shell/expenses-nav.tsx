"use client";

import {
  ChartDonut,
  ChatCenteredDots,
  FileText,
  House,
  Receipt,
} from "@phosphor-icons/react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const navItems = [
  { label: "nav.overview", icon: House, href: "/workspace" },
  { label: "nav.documents", icon: FileText, href: "/workspace/documents" },
  { label: "nav.expenses", icon: ChartDonut, href: "/workspace/expenses" },
  { label: "nav.askNexus", icon: ChatCenteredDots, href: "/workspace/ask" },
];

export function ExpensesNav({ expenseCount }: { expenseCount: number }) {
  const { t } = useTranslation();

  return (
    <>
      <SidebarGroup className="p-0 pt-4">
        <SidebarGroupContent>
          <nav aria-label={t("nav.workspaceNavigation")}>
            <SidebarMenu className="gap-1">
              {navItems.map(({ label, icon: Icon, href }) => {
                const active = href === "/workspace/expenses";
                return (
                  <SidebarMenuItem key={href}>
                    <SidebarMenuButton
                      render={<Link href={href} />}
                      isActive={active}
                      aria-current={active ? "page" : undefined}
                      tooltip={t(label)}
                      className={
                        active
                          ? "bg-[#2DD4BF]/10 text-[#5EEAD4] hover:bg-[#2DD4BF]/15 hover:text-[#99F6E4]"
                          : "text-[#8B8B95] hover:bg-white/5 hover:text-white"
                      }
                    >
                      <Icon
                        className="h-4 w-4"
                        weight={active ? "fill" : "regular"}
                      />
                      <span className="group-data-[collapsible=icon]:hidden">
                        {t(label)}
                      </span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </nav>
        </SidebarGroupContent>
      </SidebarGroup>

      <div className="mt-auto px-0 pt-4 group-data-[collapsible=icon]:hidden">
        <div className="rounded-xl border border-white/8 bg-[#0D0D0F] p-4">
          <Receipt className="h-4 w-4 text-[#5EEAD4]" weight="duotone" />
          <p className="mt-3 font-mono text-[9px] uppercase tracking-[0.14em] text-[#5EEAD4]">
            {t("expenses.trackedCount", { count: expenseCount })}
          </p>
          <p className="mt-2 text-xs leading-5 text-[#71717A]">
            {t("expenses.navHint")}
          </p>
        </div>
      </div>
    </>
  );
}
