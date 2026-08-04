"use client";

import {
  ArrowRight,
  ChartDonut,
  ChatCenteredDots,
  FileText,
  House,
  MagnifyingGlass,
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
  {
    label: "nav.overview",
    icon: House,
    href: "/workspace",
    active: true,
  },
  {
    label: "nav.documents",
    icon: FileText,
    href: "/workspace/documents",
    active: false,
  },
  {
    label: "nav.expenses",
    icon: ChartDonut,
    href: "/workspace/expenses",
    active: false,
  },
  {
    label: "nav.askNexus",
    icon: ChatCenteredDots,
    href: "/workspace/ask",
    active: false,
  },
];

type WorkspaceNavProps = {
  documentCount: number;
  onUpload: () => void;
};

export function WorkspaceNav({
  documentCount,
  onUpload,
}: WorkspaceNavProps) {
  const { t } = useTranslation();

  return (
    <>
      <SidebarGroup className="p-0 pt-4">
        <SidebarGroupContent>
          <nav aria-label={t("nav.workspaceNavigation")}>
            <SidebarMenu className="gap-1">
              {navItems.map(({ label, icon: Icon, href, active }) => (
                <SidebarMenuItem key={label}>
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
              ))}
            </SidebarMenu>
          </nav>
        </SidebarGroupContent>
      </SidebarGroup>

      <div className="mt-auto px-0 pt-4 group-data-[collapsible=icon]:hidden">
        <div className="rounded-xl border border-white/8 bg-[#0D0D0F] p-4">
          {documentCount > 0 ? (
            <>
              <MagnifyingGlass className="h-4 w-4 text-[#5EEAD4]" />
              <p className="mt-3 text-xs leading-5 text-[#71717A]">
                {t("workspace.libraryCount", { count: documentCount })}
              </p>
            </>
          ) : (
            <p className="text-xs leading-5 text-[#71717A]">
              {t("workspace.emptyLibraryHint")}
            </p>
          )}
          <button
            type="button"
            onClick={onUpload}
            className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-[#D4D4D8] hover:text-white"
          >
            {t("documents.uploadDocument")}
            <ArrowRight className="h-3.5 w-3.5" weight="bold" />
          </button>
        </div>
      </div>
    </>
  );
}
