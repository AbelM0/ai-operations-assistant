"use client";

import {
  ChatCenteredDots,
  FileText,
  House,
  Plus,
  Sparkle,
  Trash,
} from "@phosphor-icons/react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
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
      <Link
        href="/"
        className="flex w-fit items-center gap-2.5 px-2"
        aria-label={t("nav.homeAria")}
      >
        <span className="h-2.5 w-2.5 rounded-full bg-[#2DD4BF] shadow-[0_0_18px_rgba(45,212,191,0.65)]" />
        <span className="text-sm font-semibold tracking-[0.17em]">
          NEXUS<span className="text-[#71717A]">/OPS</span>
        </span>
      </Link>
      <nav
        className="mt-10 space-y-1"
        aria-label={t("nav.workspaceNavigation")}
      >
        <Link
          href="/workspace"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[#8B8B95] hover:bg-white/5 hover:text-white"
        >
          <House className="h-4 w-4" />
          {t("nav.overview")}
        </Link>
        <Link
          href="/workspace/documents"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[#8B8B95] hover:bg-white/5 hover:text-white"
        >
          <FileText className="h-4 w-4" />
          {t("nav.documents")}
        </Link>
        <Link
          href="/workspace/ask"
          aria-current="page"
          className="flex items-center gap-3 rounded-lg bg-[#2DD4BF]/10 px-3 py-2.5 text-sm text-[#5EEAD4]"
        >
          <ChatCenteredDots className="h-4 w-4" weight="fill" />
          {t("nav.askNexus")}
        </Link>
        <div className="ml-5 mt-2 border-l border-white/8 pl-3">
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
      </nav>
      <div className="mt-auto rounded-xl border border-white/8 bg-[#0D0D0F] p-4">
        <Sparkle className="h-4 w-4 text-[#5EEAD4]" />
        <p className="mt-3 text-xs leading-5 text-[#71717A]">
          {t("chat.libraryHint", { count: documentCount })}
        </p>
      </div>
    </>
  );
}
