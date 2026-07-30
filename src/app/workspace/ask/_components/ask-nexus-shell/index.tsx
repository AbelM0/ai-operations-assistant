"use client";

import { UserButton } from "@clerk/nextjs";
import { SidebarSimple, X } from "@phosphor-icons/react";
import { useTranslation } from "react-i18next";
import { LanguageToggle } from "@/components/language-toggle";
import { AskNav } from "./ask-nav";
import { ChatWorkspace } from "./chat-workspace";
import { DocumentSetup } from "./document-setup";
import { SourceSelectorDialog } from "./source-selector-dialog";
import type { AskNexusShellProps } from "./types";
import { useAskNexus } from "./use-ask-nexus";

export function AskNexusShell(props: AskNexusShellProps) {
  const { t } = useTranslation();
  const controller = useAskNexus(props);
  const {
    selectedIds,
    chatStarted,
    selectorOpen,
    mobileNavOpen,
    conversationId,
    conversations,
    loadingConversationId,
    historyError,
    deletingConversationId,
    setChatStarted,
    setSelectorOpen,
    setMobileNavOpen,
    setHistoryError,
    toggleDocument,
    startNewChat,
    loadConversation,
    deleteConversation,
  } = controller;
  const nav = (
    <AskNav
      documentCount={props.documents.length}
      conversations={conversations}
      activeConversationId={conversationId}
      loadingConversationId={loadingConversationId}
      deletingConversationId={deletingConversationId}
      onNewChat={startNewChat}
      onSelectConversation={loadConversation}
      onDeleteConversation={deleteConversation}
    />
  );

  return (
    <main className="nexus-page min-h-dvh bg-[#050505] text-white">
      <div className="nexus-workspace-grid pointer-events-none fixed inset-0 opacity-30" />

      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-white/8 bg-[#08080A]/95 px-4 py-5 backdrop-blur-xl lg:flex">
        {nav}
      </aside>

      {mobileNavOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/70"
            aria-label={t("nav.closeNavigation")}
            onClick={() => setMobileNavOpen(false)}
          />
          <aside className="relative flex h-full w-[min(20rem,88vw)] flex-col border-r border-white/10 bg-[#08080A] px-4 py-5">
            <button
              type="button"
              onClick={() => setMobileNavOpen(false)}
              className="absolute right-4 top-5 rounded-lg p-2 text-[#A1A1AA] hover:bg-white/5 hover:text-white"
              aria-label={t("nav.closeNavigation")}
            >
              <X className="h-5 w-5" />
            </button>
            {nav}
          </aside>
        </div>
      ) : null}

      <div className="relative flex min-h-dvh flex-col lg:pl-64">
        <header className="sticky top-0 z-20 flex h-17 items-center justify-between border-b border-white/8 bg-[#050505]/88 px-4 backdrop-blur-xl sm:px-7 lg:px-10">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileNavOpen(true)}
              className="rounded-lg p-2 text-[#A1A1AA] hover:bg-white/5 hover:text-white focus-visible:outline-2 focus-visible:outline-[#5EEAD4] lg:hidden"
              aria-label={t("nav.openNavigation")}
            >
              <SidebarSimple className="h-5 w-5" />
            </button>
            <div>
              <p className="text-sm font-medium text-white">
                {t("nav.askNexus")}
              </p>
              <p className="hidden text-xs text-[#71717A] sm:block">
                {t("chat.headerDescription")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <LanguageToggle />
            <UserButton
              appearance={{
                elements: {
                  userButtonBox: "h-9 w-9 rounded-lg",
                  avatarBox: "h-9 w-9 rounded-lg",
                },
              }}
            />
          </div>
        </header>

        {historyError ? (
          <div
            role="alert"
            className="mx-4 mt-4 flex items-start justify-between gap-3 rounded-lg border border-red-400/15 bg-red-400/[0.05] px-3 py-2.5 text-xs leading-5 text-red-200 sm:mx-7 lg:mx-10"
          >
            <span>{historyError}</span>
            <button
              type="button"
              onClick={() => setHistoryError(null)}
              className="shrink-0 text-red-300 hover:text-white"
              aria-label={t("common.dismissError")}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : null}

        {!chatStarted ? (
          <DocumentSetup
            documents={props.documents}
            selectedIds={selectedIds}
            onToggle={toggleDocument}
            onStart={() => setChatStarted(true)}
          />
        ) : (
          <ChatWorkspace controller={controller} />
        )}
      </div>

      <SourceSelectorDialog
        open={selectorOpen}
        documents={props.documents}
        selectedIds={selectedIds}
        onOpenChange={setSelectorOpen}
        onToggle={toggleDocument}
      />
    </main>
  );
}
