"use client";

import {
  ArrowRight,
  CaretLeft,
  CaretRight,
  FilePdf,
  FileText,
  MagnifyingGlass,
} from "@phosphor-icons/react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import type { WorkspaceDocument } from "@/lib/documents/types";
import { DocumentStatus, ExtractionStatus } from "./document-status";
import { formatDate, getFileType } from "./utils";

function extractionValue(
  document: WorkspaceDocument,
  key: string,
) {
  const field = document.extraction?.fields.find(
    (candidate) => candidate.key === key,
  );
  return field?.normalizedValue || field?.value || null;
}

type DocumentsTableProps = {
  documents: WorkspaceDocument[];
  totalCount: number;
  query: string;
  onQueryChange: (query: string) => void;
  page: number;
  onPageChange: (page: number) => void;
};

const PAGE_SIZE = 10;

function canOpenDocument(document: WorkspaceDocument) {
  return document.status === "READY" || document.status === "FAILED";
}

function DocumentFileIcon({ document }: { document: WorkspaceDocument }) {
  return (
    <div
      aria-hidden="true"
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#2DD4BF]/8 text-[#5EEAD4]"
    >
      {document.mimeType === "application/pdf" ? (
        <FilePdf className="h-4.5 w-4.5" weight="duotone" />
      ) : (
        <FileText className="h-4.5 w-4.5" weight="duotone" />
      )}
    </div>
  );
}

function DocumentKeyDetail({ document }: { document: WorkspaceDocument }) {
  const { t } = useTranslation();
  const hasFinancialDetail =
    document.extraction &&
    ["INVOICE", "RECEIPT"].includes(document.extraction.documentType);

  if (!hasFinancialDetail) {
    return (
      <span className="text-[#A1A1AA] xl:text-[#71717A]">
        {t("documents.detailUnavailable")}
      </span>
    );
  }

  return (
    <div className="min-w-0 xl:max-w-56">
      <p className="break-words text-[#D4D4D8] xl:truncate">
        {extractionValue(document, "vendor") ||
          t("documents.detailUnavailable")}
      </p>
      <p className="mt-1 break-all font-mono text-[10px] text-[#A1A1AA] xl:truncate xl:text-[#71717A]">
        {[
          extractionValue(document, "currency"),
          extractionValue(document, "total"),
        ]
          .filter(Boolean)
          .join(" ") || t("documents.amountUnavailable")}
      </p>
    </div>
  );
}

function DocumentOpenAction({
  document,
  fullWidth = false,
}: {
  document: WorkspaceDocument;
  fullWidth?: boolean;
}) {
  const { t } = useTranslation();
  const sizeClass = fullWidth
    ? "h-11 w-full justify-center px-4 text-sm xl:h-8 xl:w-auto xl:px-3 xl:text-xs"
    : "h-8 px-3 text-xs";

  if (canOpenDocument(document)) {
    return (
      <Link
        href={`/workspace/documents/${document.id}`}
        aria-label={t("documents.openDocument", {
          name: document.originalName,
        })}
        className={`inline-flex items-center gap-1.5 rounded-lg border border-[#2DD4BF]/25 bg-[#2DD4BF]/8 font-semibold text-[#5EEAD4] transition-colors hover:border-[#2DD4BF]/45 hover:bg-[#2DD4BF]/12 hover:text-[#99F6E4] active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5EEAD4] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0E0E11] ${sizeClass}`}
      >
        {t("common.open")}
        <ArrowRight
          aria-hidden="true"
          className="h-3.5 w-3.5"
          weight="bold"
        />
      </Link>
    );
  }

  return (
    <button
      type="button"
      disabled
      title={t("documents.openWhenReady")}
      aria-label={t("documents.openWhenReadyFor", {
        name: document.originalName,
      })}
      className={`inline-flex cursor-not-allowed items-center gap-1.5 rounded-lg border border-white/8 bg-white/[0.025] font-semibold text-[#52525B] ${sizeClass}`}
    >
      {t("common.open")}
      <ArrowRight
        aria-hidden="true"
        className="h-3.5 w-3.5"
        weight="bold"
      />
    </button>
  );
}

export function DocumentsTable({
  documents,
  totalCount,
  query,
  onQueryChange,
  page,
  onPageChange,
}: DocumentsTableProps) {
  const { t, i18n } = useTranslation();
  const locale = i18n.resolvedLanguage === "am" ? "am-ET" : "en";
  const pageCount = Math.max(1, Math.ceil(documents.length / PAGE_SIZE));
  const currentPage = Math.min(Math.max(page, 1), pageCount);
  const pageStart = (currentPage - 1) * PAGE_SIZE;
  const visibleDocuments = documents.slice(pageStart, pageStart + PAGE_SIZE);
  const rangeStart = documents.length === 0 ? 0 : pageStart + 1;
  const rangeEnd = Math.min(pageStart + PAGE_SIZE, documents.length);

  return (
    <section
      aria-labelledby="document-collection-heading"
      className="mt-10 overflow-hidden rounded-xl border border-white/10 bg-[#0B0B0D]"
    >
      <div className="flex flex-col gap-4 border-b border-white/8 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
        <div>
          <h2
            id="document-collection-heading"
            className="text-lg font-semibold tracking-[-0.025em] text-white"
          >
            {t("documents.uploadedDocuments")}
          </h2>
          <p className="mt-1 text-sm text-[#71717A]">
            {t("documents.documentCount", { count: totalCount })}
          </p>
        </div>
        <label className="flex h-10 w-full items-center gap-2 rounded-lg border border-white/10 bg-[#08080A] px-3 text-[#71717A] focus-within:border-[#2DD4BF]/45 sm:w-72">
          <MagnifyingGlass className="h-4 w-4 shrink-0" />
          <span className="sr-only">{t("documents.searchPlaceholder")}</span>
          <input
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder={t("documents.searchPlaceholder")}
            className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-[#52525B]"
          />
        </label>
      </div>

      {documents.length > 0 ? (
        <div className="overflow-hidden xl:overflow-x-auto">
          <table
            aria-labelledby="document-collection-heading"
            className="block w-full border-collapse text-left xl:table xl:min-w-[1120px]"
          >
            <thead className="hidden bg-[#0E0E11] font-mono text-[9px] uppercase tracking-[0.12em] text-[#71717A] xl:table-header-group">
            <tr>
              <th scope="col" className="px-7 py-3 font-medium">
                {t("documents.columnDocument")}
              </th>
              <th scope="col" className="px-4 py-3 font-medium">
                {t("documents.columnFileFormat")}
              </th>
              <th scope="col" className="px-4 py-3 font-medium">
                {t("documents.columnDocumentType")}
              </th>
              <th scope="col" className="px-4 py-3 font-medium">
                {t("documents.columnKeyDetail")}
              </th>
              <th scope="col" className="px-4 py-3 font-medium">
                {t("documents.columnUploaded")}
              </th>
              <th scope="col" className="px-4 py-3 font-medium">
                {t("documents.columnProcessingStatus")}
              </th>
              <th scope="col" className="px-4 py-3 font-medium">
                {t("documents.columnReviewStatus")}
              </th>
              <th scope="col" className="px-7 py-3 text-right font-medium">
                {t("documents.columnActions")}
              </th>
            </tr>
            </thead>
            <tbody className="grid gap-3 bg-[#050505] p-3 lg:grid-cols-2 xl:table-row-group xl:divide-y xl:divide-white/7 xl:bg-transparent xl:p-0">
            {visibleDocuments.map((document) => (
              <tr
                key={document.id}
                className="grid grid-cols-2 gap-x-4 gap-y-4 rounded-lg border border-white/10 bg-[#0E0E11] p-4 shadow-[0_12px_32px_rgba(0,0,0,0.18)] transition-colors hover:bg-[#111113] xl:table-row xl:rounded-none xl:border-0 xl:bg-transparent xl:p-0 xl:shadow-none xl:hover:bg-white/[0.025]"
              >
                <td className="order-1 col-span-2 border-b border-white/8 pb-4 xl:table-cell xl:border-0 xl:px-7 xl:py-4">
                  <div className="flex min-w-0 items-start gap-3 xl:items-center">
                    <DocumentFileIcon document={document} />
                    <span className="min-w-0 break-words text-sm font-semibold leading-5 text-[#E4E4E7] xl:max-w-sm xl:truncate xl:font-medium">
                      {document.originalName}
                    </span>
                  </div>
                </td>
                <td className="order-2 min-w-0 text-xs text-[#D4D4D8] xl:table-cell xl:px-4 xl:py-4 xl:text-[#A1A1AA]">
                  <span className="mb-1.5 block font-mono text-[9px] uppercase tracking-[0.12em] text-[#A1A1AA] xl:hidden">
                    {t("documents.columnFileFormat")}
                  </span>
                  <span className="break-words">{getFileType(document, t)}</span>
                </td>
                <td className="order-4 col-span-2 min-w-0 text-xs text-[#D4D4D8] xl:table-cell xl:px-4 xl:py-4 xl:text-[#A1A1AA]">
                  <span className="mb-1.5 block font-mono text-[9px] uppercase tracking-[0.12em] text-[#A1A1AA] xl:hidden">
                    {t("documents.columnDocumentType")}
                  </span>
                  <span className="break-words">
                    {document.extraction
                      ? t(
                          `detail.operations.types.${document.extraction.documentType.toLowerCase()}`,
                        )
                      : t("documents.notAnalyzed")}
                  </span>
                </td>
                <td className="order-5 col-span-2 min-w-0 text-xs leading-5 text-[#A1A1AA] xl:table-cell xl:px-4 xl:py-4">
                  <span className="mb-1.5 block font-mono text-[9px] uppercase tracking-[0.12em] text-[#A1A1AA] xl:hidden">
                    {t("documents.columnKeyDetail")}
                  </span>
                  <DocumentKeyDetail document={document} />
                </td>
                <td className="order-3 min-w-0 font-mono text-[10px] leading-5 text-[#A1A1AA] xl:table-cell xl:px-4 xl:py-4 xl:font-sans xl:text-xs">
                  <span className="mb-1.5 block font-mono text-[9px] uppercase tracking-[0.12em] text-[#A1A1AA] xl:hidden">
                    {t("documents.columnUploaded")}
                  </span>
                  {formatDate(document.createdAt, locale)}
                </td>
                <td className="order-6 min-w-0 xl:table-cell xl:px-4 xl:py-4">
                  <span className="mb-2 block font-mono text-[9px] uppercase tracking-[0.12em] text-[#A1A1AA] xl:hidden">
                    {t("documents.columnProcessingStatus")}
                  </span>
                  <DocumentStatus
                    status={document.status}
                    errorMessage={document.errorMessage}
                  />
                </td>
                <td className="order-7 min-w-0 xl:table-cell xl:px-4 xl:py-4">
                  <span className="mb-2 block font-mono text-[9px] uppercase tracking-[0.12em] text-[#A1A1AA] xl:hidden">
                    {t("documents.columnReviewStatus")}
                  </span>
                  <ExtractionStatus
                    status={document.extraction?.reviewStatus}
                  />
                </td>
                <td className="order-8 col-span-2 border-t border-white/8 pt-4 xl:table-cell xl:border-0 xl:px-7 xl:py-4">
                  <div className="flex items-center xl:justify-end">
                    <DocumentOpenAction document={document} fullWidth />
                  </div>
                </td>
              </tr>
            ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {documents.length === 0 ? (
        <div className="flex min-h-40 flex-col items-center justify-center px-6 text-center">
          <MagnifyingGlass className="h-6 w-6 text-[#52525B]" />
          <p className="mt-3 text-sm font-medium text-[#D4D4D8]">
            {t("documents.noSearchResults")}
          </p>
        </div>
      ) : null}

      {documents.length > 0 ? (
        <nav
          aria-label={t("documents.paginationLabel")}
          className="flex flex-col gap-3 border-t border-white/8 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7"
        >
          <p className="font-mono text-[10px] text-[#71717A]">
            {t("documents.paginationRange", {
              start: rangeStart,
              end: rangeEnd,
              total: documents.length,
            })}
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              aria-label={t("documents.previousPage")}
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 text-[#A1A1AA] transition-colors hover:border-[#2DD4BF]/30 hover:bg-[#2DD4BF]/8 hover:text-[#5EEAD4] active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5EEAD4] disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:border-white/10 disabled:hover:bg-transparent disabled:hover:text-[#A1A1AA] sm:h-8 sm:w-8"
            >
              <CaretLeft aria-hidden="true" className="h-4 w-4" weight="bold" />
            </button>
            <span className="min-w-24 text-center font-mono text-[10px] text-[#A1A1AA]">
              {t("documents.pageOf", {
                page: currentPage,
                total: pageCount,
              })}
            </span>
            <button
              type="button"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === pageCount}
              aria-label={t("documents.nextPage")}
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 text-[#A1A1AA] transition-colors hover:border-[#2DD4BF]/30 hover:bg-[#2DD4BF]/8 hover:text-[#5EEAD4] active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5EEAD4] disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:border-white/10 disabled:hover:bg-transparent disabled:hover:text-[#A1A1AA] sm:h-8 sm:w-8"
            >
              <CaretRight aria-hidden="true" className="h-4 w-4" weight="bold" />
            </button>
          </div>
        </nav>
      ) : null}
    </section>
  );
}
