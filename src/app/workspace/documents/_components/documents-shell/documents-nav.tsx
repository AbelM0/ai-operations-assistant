"use client";

import { ChartDonut, ChatCenteredDots, FileText, House, Plus } from "@phosphor-icons/react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

type DocumentsNavProps = {
  documentCount: number;
  onUpload: () => void;
};

export function DocumentsNav({
  documentCount,
  onUpload,
}: DocumentsNavProps) {
  const { t } = useTranslation();

  return (
    <>
      <SidebarGroup className="p-0 pt-4">
        <SidebarGroupContent>
          <nav aria-label={t("nav.workspaceNavigation")}>
            <SidebarMenu className="gap-1">
              <SidebarMenuItem>
                <SidebarMenuButton
                  render={<Link href="/workspace" />}
                  tooltip={t("nav.overview")}
                  className="text-[#8B8B95] hover:bg-white/5 hover:text-white"
                >
                  <House className="h-4 w-4" />
                  <span className="group-data-[collapsible=icon]:hidden">
                    {t("nav.overview")}
                  </span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  render={<Link href="/workspace/expenses" />}
                  tooltip={t("nav.expenses")}
                  className="text-[#8B8B95] hover:bg-white/5 hover:text-white"
                >
                  <ChartDonut className="h-4 w-4" />
                  <span className="group-data-[collapsible=icon]:hidden">
                    {t("nav.expenses")}
                  </span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  render={<Link href="/workspace/documents" />}
                  isActive
                  aria-current="page"
                  tooltip={t("nav.documents")}
                  className="bg-[#2DD4BF]/10 text-[#5EEAD4] hover:bg-[#2DD4BF]/15 hover:text-[#99F6E4]"
                >
                  <FileText className="h-4 w-4" weight="fill" />
                  <span className="group-data-[collapsible=icon]:hidden">
                    {t("nav.documents")}
                  </span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  render={<Link href="/workspace/ask" />}
                  tooltip={t("nav.askNexus")}
                  className="text-[#8B8B95] hover:bg-white/5 hover:text-white"
                >
                  <ChatCenteredDots className="h-4 w-4" />
                  <span className="group-data-[collapsible=icon]:hidden">
                    {t("nav.askNexus")}
                  </span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </nav>
        </SidebarGroupContent>
      </SidebarGroup>

      <div className="mt-auto px-0 pt-4 group-data-[collapsible=icon]:hidden">
        <div className="rounded-xl border border-white/8 bg-[#0D0D0F] p-4">
          <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#5EEAD4]">
            {t("documents.stored", { count: documentCount })}
          </p>
          <p className="mt-2 text-xs leading-5 text-[#71717A]">
            {t("documents.storedHint")}
          </p>
          <button
            type="button"
            onClick={onUpload}
            className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-[#D4D4D8] hover:text-white"
          >
            <Plus className="h-3.5 w-3.5" />
            {t("documents.uploadDocument")}
          </button>
        </div>
      </div>
    </>
  );
}
