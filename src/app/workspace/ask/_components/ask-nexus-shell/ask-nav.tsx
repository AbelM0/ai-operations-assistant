"use client";

import {
  ChatCenteredDots,
  ChartDonut,
  FileText,
  House,
  Plus,
  Sparkle,
  Trash,
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
import type { ConversationSummary } from "@/lib/rag/types";

type AskNavProps = {
  documentCount: number;
  conversations: ConversationSummary[];
  activeConversationId: string | null;
  loadingConversationId: string | null;
  deletingConversationId: string | null;
  onNewChat: () => void;
  onSelectConversation: (id: string) => void;
  onDeleteConversation: (id: string) => void;
};

export function AskNav({
  documentCount,
  conversations,
  activeConversationId,
  loadingConversationId,
  deletingConversationId,
  onNewChat,
  onSelectConversation,
  onDeleteConversation,
}: AskNavProps) {
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
                  tooltip={t("nav.documents")}
                  className="text-[#8B8B95] hover:bg-white/5 hover:text-white"
                >
                  <FileText className="h-4 w-4" />
                  <span className="group-data-[collapsible=icon]:hidden">
                    {t("nav.documents")}
                  </span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  render={<Link href="/workspace/ask" />}
                  isActive
                  aria-current="page"
                  tooltip={t("nav.askNexus")}
                  className="bg-[#2DD4BF]/10 text-[#5EEAD4] hover:bg-[#2DD4BF]/15 hover:text-[#99F6E4]"
                >
                  <ChatCenteredDots className="h-4 w-4" weight="fill" />
                  <span className="group-data-[collapsible=icon]:hidden">
                    {t("nav.askNexus")}
                  </span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </nav>

          <div className="ml-5 mt-2 border-l border-white/8 pl-3 group-data-[collapsible=icon]:hidden">
            <button
              type="button"
              onClick={onNewChat}
              className="mb-2 flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-xs font-medium text-[#A1A1AA] transition-colors hover:bg-[#2DD4BF]/8 hover:text-[#5EEAD4] active:translate-y-px focus-visible:outline-2 focus-visible:outline-[#5EEAD4]"
            >
              <Plus className="h-3.5 w-3.5" weight="bold" />
              {t("chat.newChat")}
            </button>
            {conversations.length > 0 ? (
              <div className="space-y-0.5">
                {conversations.slice(0, 8).map((conversation) => {
                  const active = conversation.id === activeConversationId;
                  const loading = conversation.id === loadingConversationId;
                  const deleting =
                    deletingConversationId === conversation.id;

                  return (
                    <div
                      key={conversation.id}
                      className={`group flex items-center gap-1 rounded-md transition-colors ${
                        active
                          ? "bg-white/[0.055]"
                          : "hover:bg-white/[0.035]"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => onSelectConversation(conversation.id)}
                        disabled={loading || deleting}
                        aria-current={active ? "page" : undefined}
                        title={conversation.title}
                        className={`min-w-0 flex-1 truncate rounded-md px-2 py-1.5 text-left text-xs transition-colors active:translate-y-px disabled:cursor-wait ${
                          active
                            ? "text-[#E4E4E7]"
                            : "text-[#71717A] hover:text-[#D4D4D8]"
                        } ${loading ? "animate-pulse" : ""}`}
                      >
                        {conversation.title}
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteConversation(conversation.id)}
                        disabled={loading || deleting}
                        className="mr-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[#52525B] opacity-0 transition-all hover:bg-red-400/10 hover:text-red-300 focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-[#5EEAD4] group-hover:opacity-100 disabled:cursor-wait disabled:opacity-50"
                        aria-label={t("chat.deleteConversationAria", {
                          title: conversation.title,
                        })}
                        title={t("chat.deleteConversation")}
                      >
                        <Trash className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="px-2 py-2 text-[11px] leading-4 text-[#52525B]">
                {t("chat.historyEmpty")}
              </p>
            )}
          </div>
        </SidebarGroupContent>
      </SidebarGroup>

      <div className="mt-auto px-0 pt-4 group-data-[collapsible=icon]:hidden">
        <div className="rounded-xl border border-white/8 bg-[#0D0D0F] p-4">
          <Sparkle className="h-4 w-4 text-[#5EEAD4]" />
          <p className="mt-3 text-xs leading-5 text-[#71717A]">
            {t("chat.libraryHint", { count: documentCount })}
          </p>
        </div>
      </div>
    </>
  );
}
