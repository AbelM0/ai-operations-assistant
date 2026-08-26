"use client";

import { X } from "@phosphor-icons/react";
import { useTranslation } from "react-i18next";
import { LanguageToggle } from "@/components/language-toggle";
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog";
import {
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { WorkspaceSidebar } from "@/components/workspace-sidebar";
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
    conversationId,
    conversations,
    loadingConversationId,
    historyError,
    deletingConversationId,
    conversationPendingDelete,
    setChatStarted,
    setSelectorOpen,
    setHistoryError,
    toggleDocument,
    startNewChat,
    loadConversation,
    requestDeleteConversation,
    cancelDeleteConversation,
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
      onDeleteConversation={requestDeleteConversation}
    />
  );

  return (
    <>
      <WorkspaceSidebar>{nav}</WorkspaceSidebar>

      <SidebarInset className="min-h-dvh min-w-0 bg-[#050505]">
        <div className="nexus-page relative flex min-h-dvh min-w-0 flex-col bg-[#050505] text-white">
          <div className="nexus-workspace-grid pointer-events-none fixed inset-0 opacity-30" />

        <header className="sticky top-0 z-20 flex h-17 items-center justify-between border-b border-white/8 bg-[#050505]/88 px-4 backdrop-blur-xl sm:px-7 lg:px-10">
          <div className="flex items-center gap-3">
            <SidebarTrigger
              className="h-9 w-9 rounded-lg text-[#A1A1AA] hover:bg-white/5 hover:text-white focus-visible:ring-2 focus-visible:ring-[#5EEAD4]"
              aria-label={t("nav.openNavigation")}
            />
            <div>
              <p className="text-sm font-medium text-white">
                {t("nav.askNexus")}
              </p>
              <p className="hidden text-xs text-[#71717A] sm:block">
                {t("chat.headerDescription")}
              </p>
            </div>
          </div>
          <LanguageToggle />
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
      </SidebarInset>

      <SourceSelectorDialog
        open={selectorOpen}
        documents={props.documents}
        selectedIds={selectedIds}
        onOpenChange={setSelectorOpen}
        onToggle={toggleDocument}
      />

      <DeleteConfirmationDialog
        open={conversationPendingDelete !== null}
        isDeleting={deletingConversationId !== null}
        title={t("chat.deleteDialogTitle")}
        description={t("chat.deleteDialogDescription", {
          title: conversationPendingDelete?.title ?? "",
        })}
        cancelLabel={t("common.cancel")}
        confirmLabel={t("chat.deletePermanently")}
        deletingLabel={t("chat.deleting")}
        onOpenChange={(open) => {
          if (!open) cancelDeleteConversation();
        }}
        onConfirm={deleteConversation}
      />
    </>
  );
}
