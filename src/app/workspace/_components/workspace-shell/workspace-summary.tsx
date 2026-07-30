"use client";

import { useTranslation } from "react-i18next";
import type { WorkspaceDocument } from "@/lib/documents/types";
import { formatBytes } from "./utils";

type WorkspaceSummaryProps = {
  documents: WorkspaceDocument[];
  conversationCount: number;
};

export function WorkspaceSummary({
  documents,
  conversationCount,
}: WorkspaceSummaryProps) {
  const { t } = useTranslation();
  const readyCount = documents.filter(
    (document) => document.status === "READY",
  ).length;
  const processingCount = documents.filter(
    (document) =>
      document.status !== "READY" && document.status !== "FAILED",
  ).length;
  const totalBytes = documents.reduce(
    (total, document) => total + document.sizeBytes,
    0,
  );
  const metrics = [
    {
      label: t("workspace.metrics.totalSources"),
      value: documents.length.toString(),
      detail: formatBytes(totalBytes),
    },
    {
      label: t("workspace.metrics.readyToAsk"),
      value: readyCount.toString(),
      detail: t(
        readyCount === 1
          ? "workspace.metrics.searchableDocument"
          : "workspace.metrics.searchableDocuments",
      ),
    },
    {
      label: t("workspace.metrics.processing"),
      value: processingCount.toString(),
      detail: t(
        processingCount > 0
          ? "workspace.metrics.preparingNow"
          : "workspace.metrics.queueClear",
      ),
    },
    {
      label: t("workspace.metrics.conversations"),
      value: conversationCount.toString(),
      detail: t("workspace.metrics.savedInAsk"),
    },
  ];

  return (
    <section
      aria-label={t("workspace.metrics.aria")}
      className="mt-6 grid gap-px overflow-hidden rounded-xl border border-white/10 bg-white/8 sm:grid-cols-2 xl:grid-cols-4"
    >
      {metrics.map(({ label, value, detail }) => (
        <div key={label} className="bg-[#0B0B0D] p-5 sm:p-6">
          <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#71717A]">
            {label}
          </p>
          <div className="mt-4 flex items-end justify-between gap-3">
            <p className="text-3xl font-medium tabular-nums tracking-[-0.05em] text-white">
              {value}
            </p>
            <p className="pb-1 text-right text-[10px] leading-4 text-[#5E5E66]">
              {detail}
            </p>
          </div>
        </div>
      ))}
    </section>
  );
}
