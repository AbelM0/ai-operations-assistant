"use client";

import {
  ChatCenteredDots,
  ChartDonut,
  FileText,
  House,
  Sparkle,
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

export function DetailNav() {
  const { t } = useTranslation();

  return (
    <>
      <SidebarGroup className="p-0 pt-4">
        <SidebarGroupContent>
          <nav
            className="w-full"
            aria-label={t("nav.workspaceNavigation")}
          >
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
          <Sparkle className="h-4 w-4 text-[#5EEAD4]" />
          <p className="mt-3 text-xs leading-5 text-[#71717A]">
            {t("detail.navHint")}
          </p>
        </div>
      </div>
    </>
  );
}
