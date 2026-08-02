"use client";

import { UserButton } from "@clerk/nextjs";
import { ArrowLeft, SidebarSimple, X } from "@phosphor-icons/react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { LanguageToggle } from "@/components/language-toggle";
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
    <main className="nexus-page min-h-dvh bg-[#050505] text-white">
      <div className="nexus-workspace-grid pointer-events-none fixed inset-0 opacity-30" />
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-white/8 bg-[#08080A]/95 px-4 py-5 backdrop-blur-xl lg:flex">
        <DetailNav />
      </aside>

      {detail.mobileNavOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/70"
            aria-label={t("nav.closeNavigation")}
            onClick={() => detail.setMobileNavOpen(false)}
          />
          <aside className="relative flex h-full w-[min(20rem,88vw)] flex-col border-r border-white/10 bg-[#08080A] px-4 py-5">
            <button
              type="button"
              onClick={() => detail.setMobileNavOpen(false)}
              className="absolute right-4 top-5 rounded-lg p-2 text-[#A1A1AA]"
              aria-label={t("nav.closeNavigation")}
            >
              <X className="h-5 w-5" />
            </button>
            <DetailNav />
          </aside>
        </div>
      ) : null}

      <div className="relative lg:pl-64">
        <header className="sticky top-0 z-20 flex h-17 items-center justify-between border-b border-white/8 bg-[#050505]/88 px-4 backdrop-blur-xl sm:px-7 lg:px-10">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => detail.setMobileNavOpen(true)}
              className="rounded-lg p-2 text-[#A1A1AA] hover:bg-white/5 lg:hidden"
              aria-label={t("nav.openNavigation")}
            >
              <SidebarSimple className="h-5 w-5" />
            </button>
            <Link
              href="/workspace/documents"
              className="flex items-center gap-2 text-sm text-[#A1A1AA] transition-colors hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              {t("nav.documents")}
            </Link>
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

        <div className="mx-auto w-full max-w-[1480px] px-4 pb-16 pt-8 sm:px-7 lg:px-10 lg:pb-20">
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

      <DeleteDocumentDialog
        open={detail.deleteOpen}
        isDeleting={detail.isDeleting}
        onOpenChange={detail.setDeleteOpen}
        onDelete={detail.deleteDocument}
      />
    </main>
  );
}
