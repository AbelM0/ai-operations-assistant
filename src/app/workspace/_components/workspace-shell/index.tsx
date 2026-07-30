"use client";

import { X } from "@phosphor-icons/react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { WorkspaceDocument } from "@/lib/documents/types";
import { ActiveWorkspaceOverview } from "./active-workspace-overview";
import { NewUserOverview } from "./new-user-overview";
import type { WorkspaceShellProps } from "./types";
import { UploadDialog } from "./upload-dialog";
import { WorkspaceHeader } from "./workspace-header";
import { WorkspaceNav } from "./workspace-nav";

export function WorkspaceShell({
  firstName,
  initialDocuments,
  initialConversations,
  conversationCount,
}: WorkspaceShellProps) {
  const { t } = useTranslation();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [documents, setDocuments] = useState(initialDocuments);
  const [showFirstUploadNextSteps, setShowFirstUploadNextSteps] =
    useState(false);
  const isNewUser = documents.length === 0;

  const handleUploaded = (document: WorkspaceDocument) => {
    const wasFirstUpload = documents.length === 0;
    setDocuments((current) => [document, ...current]);
    setUploadDialogOpen(false);

    if (wasFirstUpload) {
      setShowFirstUploadNextSteps(true);
    }
  };

  return (
    <main className="nexus-page min-h-dvh bg-[#050505] text-white">
      <div className="nexus-workspace-grid pointer-events-none fixed inset-0 opacity-30" />

      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-white/8 bg-[#08080A]/95 px-4 py-5 backdrop-blur-xl lg:flex">
        <WorkspaceNav
          documentCount={documents.length}
          onUpload={() => setUploadDialogOpen(true)}
        />
      </aside>

      {mobileNavOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/70"
            aria-label={t("nav.closeNavigation")}
            onClick={() => setMobileNavOpen(false)}
          />
          <aside className="relative flex h-full w-[min(20rem,88vw)] flex-col border-r border-white/10 bg-[#08080A] px-4 py-5 shadow-2xl shadow-black">
            <button
              type="button"
              onClick={() => setMobileNavOpen(false)}
              className="absolute right-4 top-5 rounded-lg p-2 text-[#A1A1AA] hover:bg-white/5 hover:text-white"
              aria-label={t("nav.closeNavigation")}
            >
              <X className="h-5 w-5" />
            </button>
            <WorkspaceNav
              documentCount={documents.length}
              onUpload={() => setUploadDialogOpen(true)}
            />
          </aside>
        </div>
      ) : null}

      <div className="relative lg:pl-64">
        <WorkspaceHeader onOpenNavigation={() => setMobileNavOpen(true)} />

        <div className="mx-auto w-full max-w-[1480px] px-4 pb-16 pt-9 sm:px-7 sm:pt-12 lg:px-10 lg:pb-20">
          {isNewUser ? (
            <NewUserOverview
              firstName={firstName}
              onUploaded={handleUploaded}
            />
          ) : (
            <ActiveWorkspaceOverview
              firstName={firstName}
              documents={documents}
              conversations={initialConversations}
              conversationCount={conversationCount}
              showFirstUploadNextSteps={showFirstUploadNextSteps}
              onUpload={() => setUploadDialogOpen(true)}
            />
          )}
        </div>
      </div>

      <UploadDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        onUploaded={handleUploaded}
      />
    </main>
  );
}
