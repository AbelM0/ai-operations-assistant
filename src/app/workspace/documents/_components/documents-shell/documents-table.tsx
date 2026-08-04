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
      aria-labelledby="document-table-heading"
      className="mt-10 overflow-hidden rounded-xl border border-white/10 bg-[#0B0B0D]"
    >
      <div className="flex flex-col gap-4 border-b border-white/8 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
        <div>
          <h2
            id="document-table-heading"
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

      <div className="overflow-x-auto">
        <table className="w-full min-w-[1120px] border-collapse text-left">
          <thead className="bg-[#0E0E11] font-mono text-[9px] uppercase tracking-[0.12em] text-[#71717A]">
            <tr>
              <th className="px-7 py-3 font-medium">
                {t("documents.columnDocument")}
              </th>
              <th className="px-4 py-3 font-medium">
                {t("documents.columnFileFormat")}
              </th>
              <th className="px-4 py-3 font-medium">
                {t("documents.columnDocumentType")}
              </th>
              <th className="px-4 py-3 font-medium">
                {t("documents.columnKeyDetail")}
              </th>
              <th className="px-4 py-3 font-medium">
                {t("documents.columnUploaded")}
              </th>
              <th className="px-4 py-3 font-medium">
                {t("documents.columnProcessingStatus")}
              </th>
              <th className="px-4 py-3 font-medium">
                {t("documents.columnReviewStatus")}
              </th>
              <th className="px-7 py-3 text-right font-medium">
                {t("documents.columnActions")}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/7">
            {visibleDocuments.map((document) => (
              <tr
                key={document.id}
                className="transition-colors hover:bg-white/[0.025]"
              >
                <td className="px-7 py-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#2DD4BF]/8 text-[#5EEAD4]">
                      {document.mimeType === "application/pdf" ? (
                        <FilePdf className="h-4.5 w-4.5" weight="duotone" />
                      ) : (
                        <FileText className="h-4.5 w-4.5" weight="duotone" />
                      )}
                    </div>
                    <span className="max-w-sm truncate text-sm font-medium text-[#E4E4E7]">
                      {document.originalName}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-4 text-xs text-[#A1A1AA]">
                  {getFileType(document, t)}
                </td>
                <td className="px-4 py-4 text-xs text-[#A1A1AA]">
                  {document.extraction
                    ? t(
                        `detail.operations.types.${document.extraction.documentType.toLowerCase()}`,
                      )
                    : t("documents.notAnalyzed")}
                </td>
                <td className="px-4 py-4 text-xs text-[#A1A1AA]">
                  {document.extraction &&
                  ["INVOICE", "RECEIPT"].includes(
                    document.extraction.documentType,
                  ) ? (
                    <div className="max-w-56">
                      <p className="truncate text-[#D4D4D8]">
                        {extractionValue(document, "vendor") ||
                          t("documents.detailUnavailable")}
                      </p>
                      <p className="mt-1 font-mono text-[10px] text-[#71717A]">
                        {[
                          extractionValue(document, "currency"),
                          extractionValue(document, "total"),
                        ]
                          .filter(Boolean)
                          .join(" ") || t("documents.amountUnavailable")}
                      </p>
                    </div>
                  ) : (
                    <span className="text-[#71717A]">
                      {t("documents.detailUnavailable")}
                    </span>
                  )}
                </td>
                <td className="px-4 py-4 text-xs text-[#A1A1AA]">
                  {formatDate(document.createdAt, locale)}
                </td>
                <td className="px-4 py-4">
                  <DocumentStatus
                    status={document.status}
                    errorMessage={document.errorMessage}
                  />
                </td>
                <td className="px-4 py-4">
                  <ExtractionStatus
                    status={document.extraction?.reviewStatus}
                  />
                </td>
                <td className="px-7 py-4">
                  <div className="flex items-center justify-end gap-2">
                    {canOpenDocument(document) ? (
                      <Link
                        href={`/workspace/documents/${document.id}`}
                        className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-[#2DD4BF]/25 bg-[#2DD4BF]/8 px-3 text-xs font-semibold text-[#5EEAD4] transition-colors hover:border-[#2DD4BF]/45 hover:bg-[#2DD4BF]/12 hover:text-[#99F6E4]"
                      >
                        {t("common.open")}
                        <ArrowRight className="h-3.5 w-3.5" weight="bold" />
                      </Link>
                    ) : (
                      <button
                        type="button"
                        disabled
                        title={t("documents.openWhenReady")}
                        aria-label={t("documents.openWhenReadyFor", {
                          name: document.originalName,
                        })}
                        className="inline-flex h-8 cursor-not-allowed items-center gap-1.5 rounded-lg border border-white/8 bg-white/[0.025] px-3 text-xs font-semibold text-[#52525B]"
                      >
                        {t("common.open")}
                        <ArrowRight className="h-3.5 w-3.5" weight="bold" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {documents.length === 0 ? (
          <div className="flex min-h-40 flex-col items-center justify-center px-6 text-center">
            <MagnifyingGlass className="h-6 w-6 text-[#52525B]" />
            <p className="mt-3 text-sm font-medium text-[#D4D4D8]">
              {t("documents.noSearchResults")}
            </p>
          </div>
        ) : null}
      </div>

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
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-[#A1A1AA] transition-colors hover:border-[#2DD4BF]/30 hover:bg-[#2DD4BF]/8 hover:text-[#5EEAD4] active:translate-y-px disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:border-white/10 disabled:hover:bg-transparent disabled:hover:text-[#A1A1AA]"
            >
              <CaretLeft className="h-4 w-4" weight="bold" />
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
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-[#A1A1AA] transition-colors hover:border-[#2DD4BF]/30 hover:bg-[#2DD4BF]/8 hover:text-[#5EEAD4] active:translate-y-px disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:border-white/10 disabled:hover:bg-transparent disabled:hover:text-[#A1A1AA]"
            >
              <CaretRight className="h-4 w-4" weight="bold" />
            </button>
          </div>
        </nav>
      ) : null}
    </section>
  );
}
