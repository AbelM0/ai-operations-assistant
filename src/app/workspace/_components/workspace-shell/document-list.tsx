"use client";

import { ArrowRight, FilePdf, FileText } from "@phosphor-icons/react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import type { WorkspaceDocument } from "@/lib/documents/types";
import { StatusLabel } from "./status-label";
import { formatBytes, formatDate } from "./utils";

export function DocumentList({
  documents,
}: {
  documents: WorkspaceDocument[];
}) {
  const { t, i18n } = useTranslation();
  const locale = i18n.resolvedLanguage === "am" ? "am-ET" : "en";

  return (
    <section
      aria-labelledby="documents-heading"
      className="overflow-hidden rounded-xl border border-white/10 bg-[#0B0B0D]"
    >
      <div className="flex items-center justify-between gap-4 border-b border-white/8 px-5 py-5 sm:px-6">
        <div>
          <h2
            id="documents-heading"
            className="text-lg font-semibold tracking-[-0.025em] text-white"
          >
            {t("workspace.recentDocuments.title")}
          </h2>
          <p className="mt-1 text-sm text-[#71717A]">
            {t("workspace.recentDocuments.description")}
          </p>
        </div>
        <Link
          href="/workspace/documents"
          className="inline-flex h-9 items-center gap-2 rounded-lg border border-white/10 px-3.5 text-xs font-semibold text-[#D4D4D8] transition-colors hover:border-[#2DD4BF]/35 hover:bg-[#2DD4BF]/8 hover:text-white"
        >
          {t("workspace.recentDocuments.viewAll")}
          <ArrowRight className="h-3.5 w-3.5" weight="bold" />
        </Link>
      </div>
      <div className="divide-y divide-white/7">
        {documents.slice(0, 4).map((document) => {
          const canOpen = ["READY", "FAILED"].includes(document.status);
          const content = (
            <>
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#2DD4BF]/8 text-[#5EEAD4]">
                {document.mimeType === "application/pdf" ? (
                  <FilePdf className="h-5 w-5" weight="duotone" />
                ) : (
                  <FileText className="h-5 w-5" weight="duotone" />
                )}
              </div>
              <div className="min-w-0">
                <h3 className="truncate text-sm font-medium text-[#E4E4E7] transition-colors group-hover:text-white">
                  {document.originalName}
                </h3>
                <p className="mt-1 text-xs text-[#71717A]">
                  {formatBytes(document.sizeBytes)} •{" "}
                  {formatDate(document.createdAt, locale)}
                </p>
              </div>
            </div>
            <StatusLabel status={document.status} />
            </>
          );
          const className = `group grid gap-4 px-5 py-4 transition-colors sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:px-6 ${
            canOpen
              ? "hover:bg-white/[0.035]"
              : "cursor-wait bg-white/[0.012] opacity-70"
          }`;

          return canOpen ? (
            <Link
              key={document.id}
              href={`/workspace/documents/${document.id}`}
              className={className}
            >
              {content}
            </Link>
          ) : (
            <div
              key={document.id}
              aria-disabled="true"
              title={t("documents.openWhenReady")}
              className={className}
            >
              {content}
            </div>
          );
        })}
      </div>
    </section>
  );
}
