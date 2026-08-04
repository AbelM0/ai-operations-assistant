"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { SidebarInset } from "@/components/ui/sidebar";
import { WorkspaceSidebar } from "@/components/workspace-sidebar";
import type { WorkspaceDocument } from "@/lib/documents/types";
import { useDocumentPolling } from "../../documents/_components/documents-shell/use-document-polling";
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
  recentExpenses,
  expenseCount,
  expenseAttentionCount,
}: WorkspaceShellProps) {
  const { t } = useTranslation();
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const { documents, addDocument } = useDocumentPolling(initialDocuments, t);
  const [showFirstUploadNextSteps, setShowFirstUploadNextSteps] =
    useState(false);
  const isNewUser = documents.length === 0;

  const handleUploaded = (document: WorkspaceDocument) => {
    const wasFirstUpload = documents.length === 0;
    addDocument(document);
    setUploadDialogOpen(false);

    if (wasFirstUpload) {
      setShowFirstUploadNextSteps(true);
    }
  };

  return (
    <>
      <WorkspaceSidebar>
        <WorkspaceNav
          documentCount={documents.length}
          onUpload={() => setUploadDialogOpen(true)}
        />
      </WorkspaceSidebar>

      <SidebarInset className="min-h-dvh bg-[#050505]">
        <div className="nexus-page min-h-dvh bg-[#050505] text-white">
          <div className="nexus-workspace-grid pointer-events-none fixed inset-0 opacity-30" />

          <WorkspaceHeader />

          <div className="relative mx-auto w-full max-w-[1480px] px-4 pb-16 pt-9 sm:px-7 sm:pt-12 lg:px-10 lg:pb-20">
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
                recentExpenses={recentExpenses}
                expenseCount={expenseCount}
                expenseAttentionCount={expenseAttentionCount}
                showFirstUploadNextSteps={showFirstUploadNextSteps}
                onUpload={() => setUploadDialogOpen(true)}
              />
            )}
          </div>
        </div>
      </SidebarInset>

      <UploadDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        onUploaded={handleUploaded}
      />
    </>
  );
}
