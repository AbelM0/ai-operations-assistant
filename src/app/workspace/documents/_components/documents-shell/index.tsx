"use client";

import { Plus } from "@phosphor-icons/react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { LanguageToggle } from "@/components/language-toggle";
import {
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { WorkspaceSidebar } from "@/components/workspace-sidebar";
import type { WorkspaceDocument } from "@/lib/documents/types";
import { DocumentsNav } from "./documents-nav";
import { DocumentsTable } from "./documents-table";
import { EmptyDocuments } from "./empty-documents";
import { UploadDialog } from "./upload-dialog";
import { useDocumentPolling } from "./use-document-polling";

export function DocumentsShell({
  initialDocuments,
}: {
  initialDocuments: WorkspaceDocument[];
}) {
  const { t } = useTranslation();
  const { documents, addDocument } = useDocumentPolling(initialDocuments, t);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const filteredDocuments = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return documents;

    return documents.filter((document) =>
      document.originalName.toLowerCase().includes(normalized),
    );
  }, [documents, query]);

  const handleUploaded = (document: WorkspaceDocument) => {
    addDocument(document);
    setPage(1);
    setUploadDialogOpen(false);
  };

  const handleQueryChange = (nextQuery: string) => {
    setQuery(nextQuery);
    setPage(1);
  };

  return (
    <>
      <WorkspaceSidebar>
        <DocumentsNav
          documentCount={documents.length}
          onUpload={() => setUploadDialogOpen(true)}
        />
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
              <div>
                <p className="text-sm font-medium text-white">
                  {t("nav.documents")}
                </p>
                <p className="hidden text-xs text-[#71717A] sm:block">
                  {t("documents.headerDescription")}
                </p>
              </div>
            </div>
            <LanguageToggle />
          </header>

          <div className="relative mx-auto w-full max-w-[1480px] px-4 pb-16 pt-9 sm:px-7 sm:pt-12 lg:px-10 lg:pb-20">
            {documents.length === 0 ? (
              <EmptyDocuments onUploaded={handleUploaded} />
            ) : (
              <>
                <section className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                  <div className="max-w-3xl">
                    <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-[#5EEAD4]">
                      {t("documents.library")}
                    </p>
                    <h1 className="mt-4 text-balance text-[clamp(2.4rem,5vw,4.6rem)] font-medium leading-[0.98] tracking-[-0.05em] text-white">
                      {t("documents.heroTitle")}
                    </h1>
                    <p className="mt-5 max-w-xl text-base leading-7 text-[#A1A1AA] sm:text-lg">
                      {t("documents.heroDescription")}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setUploadDialogOpen(true)}
                    className="inline-flex h-11 w-fit items-center gap-2 rounded-lg bg-[#2DD4BF] px-5 text-sm font-semibold text-[#04100E] transition-colors hover:bg-[#5EEAD4] active:translate-y-px"
                  >
                    <Plus className="h-4 w-4" weight="bold" />
                    {t("documents.uploadDocument")}
                  </button>
                </section>

                <DocumentsTable
                  documents={filteredDocuments}
                  totalCount={documents.length}
                  query={query}
                  onQueryChange={handleQueryChange}
                  page={page}
                  onPageChange={setPage}
                />
              </>
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
