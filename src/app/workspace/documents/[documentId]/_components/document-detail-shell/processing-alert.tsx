"use client";

import { ArrowClockwise, SpinnerGap } from "@phosphor-icons/react";
import { useTranslation } from "react-i18next";
import type { WorkspaceDocumentDetail } from "@/lib/documents/types";

type ProcessingAlertProps = {
  document: WorkspaceDocumentDetail;
  isRetrying: boolean;
  onRetry: () => void;
};

export function ProcessingAlert({
  document,
  isRetrying,
  onRetry,
}: ProcessingAlertProps) {
  const { t } = useTranslation();

  if (!["UPLOADED", "FAILED"].includes(document.status)) return null;

  return (
    <section
      className={`mt-6 flex flex-col gap-4 rounded-xl p-5 sm:flex-row sm:items-center sm:justify-between ${
        document.status === "FAILED"
          ? "border border-red-400/15 bg-red-400/[0.04]"
          : "border border-amber-300/15 bg-amber-300/[0.04]"
      }`}
    >
      <div>
        <p
          className={`text-sm font-semibold ${
            document.status === "FAILED"
              ? "text-red-200"
              : "text-amber-100"
          }`}
        >
          {document.status === "FAILED"
            ? t("detail.processingFailed")
            : t("detail.processingNotStarted")}
        </p>
        <p className="mt-1 text-sm text-[#A1A1AA]">
          {document.status === "FAILED"
            ? document.errorMessage ||
              t("detail.documentProcessFailedBody")
            : t("detail.processingNotStartedBody")}
        </p>
      </div>
      <button
        type="button"
        disabled={isRetrying}
        onClick={onRetry}
        className="inline-flex h-10 w-fit items-center gap-2 rounded-lg bg-white px-4 text-sm font-semibold text-[#09090B] disabled:opacity-60"
      >
        {isRetrying ? (
          <SpinnerGap className="h-4 w-4 animate-spin" />
        ) : (
          <ArrowClockwise className="h-4 w-4" />
        )}
        {t("detail.restartProcessing")}
      </button>
    </section>
  );
}
