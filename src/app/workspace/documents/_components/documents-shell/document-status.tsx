"use client";

import { useTranslation } from "react-i18next";
import type { ExtractionReviewStatus } from "@/lib/documents/types";

type DocumentStatusProps = {
  status: string;
  errorMessage?: string | null;
};

export function DocumentStatus({
  status,
  errorMessage,
}: DocumentStatusProps) {
  const { t } = useTranslation();
  const isReady = status === "READY";
  const isFailed = status === "FAILED";

  return (
    <span
      title={
        isFailed
          ? errorMessage || t("documents.processingFailed")
          : undefined
      }
      className={`inline-flex rounded-md border px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.1em] ${
        isReady
          ? "border-[#2DD4BF]/25 bg-[#2DD4BF]/8 text-[#5EEAD4]"
          : isFailed
            ? "border-red-400/20 bg-red-400/8 text-red-300"
            : "border-white/10 bg-white/5 text-[#A1A1AA]"
      }`}
    >
      {t(`documents.status.${status.replace("OCR_", "").toLowerCase()}`, {
        defaultValue: status.replaceAll("_", " ").toLowerCase(),
      })}
    </span>
  );
}

export function ExtractionStatus({
  status,
}: {
  status?: ExtractionReviewStatus;
}) {
  const { t } = useTranslation();

  if (!status) {
    return (
      <span className="inline-flex rounded-md border border-white/10 bg-white/5 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.1em] text-[#71717A]">
        {t("documents.notAnalyzed")}
      </span>
    );
  }

  const tone =
    status === "CONFIRMED"
      ? "border-[#2DD4BF]/25 bg-[#2DD4BF]/8 text-[#5EEAD4]"
      : status === "NEEDS_REVIEW"
        ? "border-amber-300/20 bg-amber-300/[0.06] text-amber-200"
        : status === "FAILED"
          ? "border-red-400/20 bg-red-400/8 text-red-300"
          : "border-white/10 bg-white/5 text-[#A1A1AA]";

  return (
    <span
      className={`inline-flex rounded-md border px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.1em] ${tone}`}
    >
      {t(`detail.operations.status.${status.toLowerCase()}`)}
    </span>
  );
}
