"use client";

import { FileText, Plus } from "@phosphor-icons/react";
import { useTranslation } from "react-i18next";
import { ChatComposer } from "./chat-composer";
import { ChatMessages } from "./chat-messages";
import type { AskNexusController } from "./use-ask-nexus";

export function ChatWorkspace({
  controller,
}: {
  controller: AskNexusController;
}) {
  const { t } = useTranslation();
  const {
    conversationId,
    selectedIds,
    messagesEndRef,
    setSelectorOpen,
    startNewChat,
  } = controller;

  return (
    <section className="mx-auto flex w-full min-w-0 max-w-5xl flex-1 flex-col px-4 sm:px-7 lg:px-10">
      <div className="flex items-center justify-between gap-4 border-b border-white/8 py-4">
        <button
          type="button"
          onClick={() => setSelectorOpen(true)}
          className="group flex min-w-0 items-center gap-3 rounded-lg p-1 text-left focus-visible:outline-2 focus-visible:outline-[#5EEAD4]"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#2DD4BF]/10 text-[#5EEAD4]">
            <FileText className="h-4 w-4" weight="fill" />
          </span>
          <span className="min-w-0">
            <span className="block text-xs font-medium text-[#E4E4E7]">
              {t(
                selectedIds.length === 1
                  ? "chat.sourceSelected"
                  : "chat.sourcesSelected",
                { count: selectedIds.length },
              )}
            </span>
            <span className="block truncate text-[11px] text-[#71717A] group-hover:text-[#A1A1AA]">
              {t("chat.changeContext")}
            </span>
          </span>
        </button>
        {/* <button
          type="button"
          onClick={startNewChat}
          className="inline-flex h-9 items-center gap-2 rounded-lg border border-white/10 px-3 text-xs font-medium text-[#D4D4D8] transition-colors hover:border-[#2DD4BF]/30 hover:bg-[#2DD4BF]/8 hover:text-white active:translate-y-px"
        >
          <Plus className="h-3.5 w-3.5" weight="bold" />
          {t("chat.newChat")}
        </button> */}
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <ChatMessages
          key={conversationId ?? "new-conversation"}
          controller={controller}
        />
        <ChatComposer controller={controller} />
        <div ref={messagesEndRef} className="h-px" aria-hidden />
      </div>
    </section>
  );
}
