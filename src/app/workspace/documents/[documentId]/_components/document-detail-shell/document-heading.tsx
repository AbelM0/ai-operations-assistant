"use client";

import {
  ArrowSquareOut,
  DownloadSimple,
  Trash,
} from "@phosphor-icons/react";
import { useTranslation } from "react-i18next";
import type { WorkspaceDocumentDetail } from "@/lib/documents/types";
import { Status } from "./status";
import { formatBytes, formatDate } from "./utils";

type DocumentHeadingProps = {
  document: WorkspaceDocumentDetail;
  locale: string;
  onDelete: () => void;
};

export function DocumentHeading({
  document,
  locale,
  onDelete,
}: DocumentHeadingProps) {
  const { t } = useTranslation();

  return (
    <section className="flex flex-col gap-4 border-b border-white/8 pb-4 xl:flex-row xl:items-end xl:justify-between">
      <div className="min-w-0 max-w-3xl">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#5EEAD4]">
            {t("detail.record")}
          </span>
          <Status status={document.status} />
        </div>
        <h1 className="mt-2 break-words text-[clamp(1.75rem,3vw,2.75rem)] font-medium leading-[1.04] tracking-[-0.045em] text-white">
          {document.originalName}
        </h1>
        <p className="mt-2 text-xs text-[#71717A] sm:text-sm">
          {formatBytes(document.sizeBytes)}
          <span className="mx-2 text-[#3F3F46]">/</span>
          {t("detail.uploaded")} {formatDate(document.createdAt, locale)}
          {document.pageCount ? (
            <>
              <span className="mx-2 text-[#3F3F46]">/</span>
              {t("detail.pages", { count: document.pageCount })}
            </>
          ) : null}
        </p>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {/* <a
          href={`/api/documents/${document.id}/file`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-white/10 px-3 text-xs font-medium text-[#D4D4D8] hover:border-[#2DD4BF]/30 hover:bg-[#2DD4BF]/8 hover:text-white"
        >
          <ArrowSquareOut className="h-4 w-4" />
          {t("detail.viewOriginal")}
        </a> */}
        <a
          href={`/api/documents/${document.id}/file?download=1`}
          className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-white/10 px-3 text-xs font-medium text-[#D4D4D8] hover:border-[#2DD4BF]/30 hover:bg-[#2DD4BF]/8 hover:text-white"
        >
          <DownloadSimple className="h-4 w-4" />
          {t("common.download")}
        </a>
        <button
          type="button"
          onClick={onDelete}
          className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-red-400/15 px-3 text-xs font-medium text-red-300 hover:bg-red-400/8"
        >
          <Trash className="h-4 w-4" />
          {t("common.delete")}
        </button>
      </div>
    </section>
  );
}
