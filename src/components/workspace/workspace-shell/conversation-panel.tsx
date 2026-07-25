"use client";

import {
  ArrowRight,
  ChatCenteredDots,
  Clock,
  Sparkle,
} from "@phosphor-icons/react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import type { ConversationSummary } from "@/lib/rag/types";
import { formatDate } from "./utils";

export function ConversationPanel({
  conversations,
}: {
  conversations: ConversationSummary[];
}) {
  const { t, i18n } = useTranslation();
  const locale = i18n.resolvedLanguage === "am" ? "am-ET" : "en";

  return (
    <aside className="overflow-hidden rounded-xl border border-white/10 bg-[#0B0B0D]">
      <div className="border-b border-white/8 px-5 py-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold tracking-[-0.025em] text-white">
              {t("workspace.conversations.title")}
            </h2>
            <p className="mt-1 text-xs leading-5 text-[#71717A]">
              {t("workspace.conversations.description")}
            </p>
          </div>
          <ChatCenteredDots
            className="h-5 w-5 shrink-0 text-[#5EEAD4]"
            weight="duotone"
          />
        </div>
      </div>
      <div className="p-2">
        {conversations.length > 0 ? (
          <div className="space-y-0.5">
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                className="flex items-start gap-3 rounded-lg px-3 py-3 transition-colors hover:bg-white/[0.035]"
              >
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-[#52525B]" />
                <div className="min-w-0">
                  <p className="truncate text-xs font-medium text-[#D4D4D8]">
                    {conversation.title}
                  </p>
                  <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.1em] text-[#52525B]">
                    {formatDate(
                      conversation.lastMessageAt ?? conversation.createdAt,
                      locale,
                    )}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-3 py-8 text-center">
            <Sparkle className="mx-auto h-5 w-5 text-[#3F3F46]" />
            <p className="mt-3 text-xs leading-5 text-[#71717A]">
              {t("workspace.conversations.empty")}
            </p>
          </div>
        )}
        <Link
          href="/workspace/ask"
          className="mt-2 flex h-10 items-center justify-between rounded-lg bg-[#2DD4BF]/9 px-3.5 text-xs font-semibold text-[#5EEAD4] transition-colors hover:bg-[#2DD4BF]/14"
        >
          {conversations.length > 0
            ? t("workspace.conversations.openHistory")
            : t("workspace.conversations.startFirst")}
          <ArrowRight className="h-3.5 w-3.5" weight="bold" />
        </Link>
      </div>
    </aside>
  );
}
