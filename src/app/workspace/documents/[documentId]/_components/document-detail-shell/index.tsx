"use client";

import { ArrowLeft } from "@phosphor-icons/react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { LanguageToggle } from "@/components/language-toggle";
import {
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { WorkspaceSidebar } from "@/components/workspace-sidebar";
import { DeleteDocumentDialog } from "./delete-document-dialog";
import { DetailNav } from "./detail-nav";
import { DocumentHeading } from "./document-heading";
import { DocumentTabs } from "./document-tabs";
import { ProcessingAlert } from "./processing-alert";
import type { DocumentDetailShellProps } from "./types";
import { useDocumentDetail } from "./use-document-detail";

export function DocumentDetailShell({
  initialDocument,
  models,
  defaultModel,
  citedPage,
}: DocumentDetailShellProps) {
  const { t, i18n } = useTranslation();
  const locale = i18n.resolvedLanguage === "am" ? "am-ET" : "en";
  const detail = useDocumentDetail(initialDocument);

  return (
    <>
      <WorkspaceSidebar>
        <DetailNav />
      </WorkspaceSidebar>

      <SidebarInset className="min-h-dvh bg-[#050505]">
        <div className="nexus-page min-h-dvh bg-[#050505] text-white">
          <div className="nexus-workspace-grid pointer-events-none fixed inset-0 opacity-30" />

        <header className="sticky top-0 z-20 flex h-17 items-center justify-between border-b border-white/8 bg-[#050505]/88 px-4 backdrop-blur-xl sm:px-7 lg:px-10">
          <div className="flex items-center gap-3">
            <SidebarTrigger
              className="h-9 w-9 rounded-lg text-[#A1A1AA] hover:bg-white/5 hover:text-white focus-visible:ring-2 focus-visible:ring-[#5EEAD4]"
              aria-label={t("nav.openNavigation")}
            />
            <Link
              href="/workspace/documents"
              className="flex items-center gap-2 text-sm text-[#A1A1AA] transition-colors hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              {t("nav.documents")}
            </Link>
          </div>
          <LanguageToggle />
        </header>

        <div className="mx-auto w-full max-w-[1480px] px-4 pb-10 pt-4 sm:px-7 sm:pb-12 sm:pt-5 lg:px-10 lg:pb-14 lg:pt-6">
          <DocumentHeading
            document={detail.document}
            locale={locale}
            onDelete={() => detail.setDeleteOpen(true)}
          />
          <ProcessingAlert
            document={detail.document}
            isRetrying={detail.isRetrying}
            onRetry={detail.retry}
          />
          <DocumentTabs
            document={detail.document}
            models={models}
            locale={locale}
            defaultModel={defaultModel}
            citedPage={citedPage}
            onDocumentChange={detail.setDocument}
          />
        </div>
        </div>
      </SidebarInset>

      <DeleteDocumentDialog
        open={detail.deleteOpen}
        isDeleting={detail.isDeleting}
        onOpenChange={detail.setDeleteOpen}
        onDelete={detail.deleteDocument}
      />
    </>
  );
}
