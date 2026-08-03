"use client";

import { FileCsv, FilePdf, FileText, X } from "@phosphor-icons/react";
import type { ChatStatus } from "ai";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { StreamingMarkdown } from "@/components/ai/streaming-markdown";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { SummaryUIMessage } from "@/lib/ai/stream-types";
import type { WorkspaceDocumentDetail } from "@/lib/documents/types";
import { formatDate } from "./utils";

type SummaryViewerProps = {
  document: WorkspaceDocumentDetail;
  locale: string;
  selectedModel: string;
  messages: SummaryUIMessage[];
  status: ChatStatus;
  error: Error | undefined;
  clearError: () => void;
  clearMessages: () => void;
};

export function SummaryViewer({
  document,
  locale,
  selectedModel,
  messages,
  status,
  error,
  clearError,
  clearMessages,
}: SummaryViewerProps) {
  const { t } = useTranslation();
  const [selectedSummaryId, setSelectedSummaryId] = useState(
    document.summaries[0]?.id || "",
  );
  const summaryScrollRef = useRef<HTMLDivElement | null>(null);
  const shouldFollowStreamRef = useRef(true);
  const isSummarizing = status === "submitted" || status === "streaming";

  const latestAssistantMessage = messages.findLast(
    (message) => message.role === "assistant",
  );
  const streamedSummary =
    latestAssistantMessage?.parts
      .filter(
        (part): part is { type: "text"; text: string } =>
          part.type === "text",
      )
      .map((part) => part.text)
      .join("") ?? "";

  const currentSummary =
    document.summaries.find(
      (summary) => summary.id === selectedSummaryId,
    ) || document.summaries[0];

  useEffect(() => {
    if (
      status !== "streaming" ||
      !streamedSummary ||
      !shouldFollowStreamRef.current
    ) {
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      const container = summaryScrollRef.current;
      if (container) container.scrollTo({ top: container.scrollHeight });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [status, streamedSummary]);

  const handleSummaryScroll = () => {
    const container = summaryScrollRef.current;
    if (!container) return;

    const distanceFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;
    shouldFollowStreamRef.current = distanceFromBottom < 96;
  };

  const selectSummary = (summaryId: string) => {
    clearMessages();
    setSelectedSummaryId(summaryId);
  };
  const exportHref = (format: "pdf" | "csv") =>
    currentSummary
      ? `/api/documents/${document.id}/summary/export?format=${format}&summaryId=${currentSummary.id}`
      : "#";

  return (
    <section className="min-h-[34rem] overflow-hidden rounded-xl border border-white/10 bg-[#0B0B0D]">
      <div className="flex flex-col gap-4 border-b border-white/8 p-5 sm:flex-row sm:items-center sm:justify-between sm:px-7 sm:py-6">
        <div className="flex items-start gap-3">
          {isSummarizing ? (
            <span
              className="mt-1.5 h-2 w-2 shrink-0 animate-pulse rounded-full bg-[#5EEAD4] shadow-[0_0_0_4px_rgba(45,212,191,0.1)]"
              aria-hidden="true"
            />
          ) : null}
          <div>
            <h2 className="text-lg font-semibold tracking-[-0.02em]">
              {t("detail.summary")}
            </h2>
            <p className="mt-1 text-xs text-[#71717A]">
              {isSummarizing
                ? status === "streaming"
                  ? t("detail.generatingLive", { model: selectedModel })
                  : t("detail.preparingContext")
                : document.summaries.length
                  ? t("detail.savedVersion", {
                      count: document.summaries.length,
                    })
                  : t("detail.noSummary")}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {document.summaries.length > 1 ? (
            <Select
              value={currentSummary?.id}
              onValueChange={(value) => {
                if (value) selectSummary(value);
              }}
              disabled={isSummarizing}
              items={document.summaries.map((savedSummary, index) => ({
                value: savedSummary.id,
                label: t("detail.version", {
                  number: document.summaries.length - index,
                  model: savedSummary.model,
                }),
              }))}
            >
              <SelectTrigger
                aria-label={t("detail.summaryVersion")}
                className="max-w-48 border-white/10 bg-[#111113] text-xs text-[#D4D4D8] data-[size=default]:h-9 focus-visible:border-[#2DD4BF]/50 focus-visible:ring-[#2DD4BF]/20 disabled:text-[#52525B]"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent align="end">
                {document.summaries.map((savedSummary, index) => (
                  <SelectItem value={savedSummary.id} key={savedSummary.id}>
                    {t("detail.version", {
                      number: document.summaries.length - index,
                      model: savedSummary.model,
                    })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : null}
          {currentSummary ? (
            <>
              <a
                href={exportHref("pdf")}
                className="inline-flex h-9 items-center gap-1.5 rounded-md border border-white/10 px-3 text-xs font-medium text-[#D4D4D8] hover:bg-white/5"
              >
                <FilePdf className="h-3.5 w-3.5" />
                PDF
              </a>
              <a
                href={exportHref("csv")}
                className="inline-flex h-9 items-center gap-1.5 rounded-md border border-white/10 px-3 text-xs font-medium text-[#D4D4D8] hover:bg-white/5"
              >
                <FileCsv className="h-3.5 w-3.5" />
                CSV
              </a>
            </>
          ) : null}
        </div>
      </div>
      <div
        ref={summaryScrollRef}
        onScroll={handleSummaryScroll}
        aria-busy={isSummarizing}
        className="max-h-[66dvh] overflow-y-auto p-5 sm:p-7 lg:px-9"
      >
        {error ? (
          <div
            role="alert"
            className="mb-5 flex items-start justify-between gap-3 rounded-lg border border-red-400/15 bg-red-400/[0.05] px-3 py-2.5 text-xs leading-5 text-red-200"
          >
            <span>{error.message}</span>
            <button
              type="button"
              onClick={clearError}
              className="shrink-0 text-red-300 hover:text-white"
              aria-label={t("common.dismissError")}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : null}
        {isSummarizing && !streamedSummary ? (
          <div className="mx-auto max-w-3xl py-4" aria-live="polite">
            <p className="text-sm font-medium text-[#D4D4D8]">
              {t("detail.preparingContext")}
            </p>
            <p className="mt-1 text-xs leading-5 text-[#71717A]">
              {t("detail.preparingContextDetail")}
            </p>
            <div className="mt-5 space-y-2">
              <div className="h-2.5 w-4/5 animate-pulse rounded bg-white/8" />
              <div className="h-2.5 w-2/3 animate-pulse rounded bg-white/6" />
            </div>
          </div>
        ) : streamedSummary ? (
          <div className="mx-auto max-w-3xl">
            {isSummarizing ? (
              <div
                className="mb-5 flex items-center gap-2 border-b border-[#2DD4BF]/10 pb-3 font-mono text-[9px] uppercase tracking-[0.12em] text-[#5EEAD4]"
                role="status"
                aria-live="polite"
              >
                <span
                  className="h-1.5 w-1.5 animate-pulse rounded-full bg-current"
                  aria-hidden="true"
                />
                {t("detail.generatingLive", { model: selectedModel })}
              </div>
            ) : null}
            <StreamingMarkdown streaming={status === "streaming"}>
              {streamedSummary}
            </StreamingMarkdown>
            <SummaryMetadata
              isSummarizing={isSummarizing}
              selectedModel={selectedModel}
              currentSummary={currentSummary}
              locale={locale}
            />
          </div>
        ) : currentSummary ? (
          <div className="mx-auto max-w-3xl">
            <StreamingMarkdown>{currentSummary.summary}</StreamingMarkdown>
            <SummaryMetadata
              isSummarizing={false}
              selectedModel={selectedModel}
              currentSummary={currentSummary}
              locale={locale}
            />
          </div>
        ) : (
          <div className="flex min-h-80 flex-col items-center justify-center text-center">
            <FileText className="h-8 w-8 text-[#3F3F46]" />
            <p className="mt-4 text-sm font-medium text-[#A1A1AA]">
              {t("detail.emptySummary")}
            </p>
            <p className="mt-2 max-w-sm text-xs leading-5 text-[#52525B]">
              {t("detail.emptySummaryHint")}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

function SummaryMetadata({
  isSummarizing,
  selectedModel,
  currentSummary,
  locale,
}: {
  isSummarizing: boolean;
  selectedModel: string;
  currentSummary: WorkspaceDocumentDetail["summaries"][number] | undefined;
  locale: string;
}) {
  const { t } = useTranslation();

  return (
    <div className="mt-9 border-t border-white/8 pt-4 font-mono text-[9px] uppercase tracking-[0.1em] text-[#52525B]">
      {isSummarizing
        ? t("detail.generatingLive", { model: selectedModel })
        : currentSummary
          ? t("detail.generatedAt", {
              date: formatDate(currentSummary.createdAt, locale),
              model: currentSummary.model,
            })
          : t("detail.generatedWith", { model: selectedModel })}
    </div>
  );
}
