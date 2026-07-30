"use client";

import type { UseChatHelpers } from "@ai-sdk/react";
import { CaretDown, Sparkle, X } from "@phosphor-icons/react";
import type { ChatStatus } from "ai";
import { useTranslation } from "react-i18next";
import type { SummaryModelOption } from "@/lib/ai/models";
import type { SummaryUIMessage } from "@/lib/ai/stream-types";
import type { WorkspaceDocumentDetail } from "@/lib/documents/types";

type SummaryControlsProps = {
  document: WorkspaceDocumentDetail;
  models: SummaryModelOption[];
  selectedModel: string;
  status: ChatStatus;
  sendMessage: UseChatHelpers<SummaryUIMessage>["sendMessage"];
  stop: UseChatHelpers<SummaryUIMessage>["stop"];
  setMessages: UseChatHelpers<SummaryUIMessage>["setMessages"];
  clearError: UseChatHelpers<SummaryUIMessage>["clearError"];
  onModelChange: (model: string) => void;
};

export function SummaryControls({
  document,
  models,
  selectedModel,
  status,
  sendMessage,
  stop,
  setMessages,
  clearError,
  onModelChange,
}: SummaryControlsProps) {
  const { t } = useTranslation();
  const isSummarizing = status === "submitted" || status === "streaming";

  const summarize = () => {
    if (isSummarizing || document.status !== "READY") return;

    clearError();
    setMessages([]);
    void sendMessage(
      { text: "Generate a comprehensive summary of this document." },
      { body: { model: selectedModel } },
    );
  };

  return (
    <section className="rounded-xl border border-[#2DD4BF]/20 bg-[#09100F] p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#2DD4BF]/10 text-[#5EEAD4]">
          <Sparkle className="h-5 w-5" weight="fill" />
        </div>
        {isSummarizing ? (
          <div
            className="inline-flex items-center gap-2 text-xs font-medium text-[#99F6E4]"
            aria-live="polite"
          >
            <span className="relative flex h-2 w-2" aria-hidden="true">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#2DD4BF] opacity-50" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#5EEAD4]" />
            </span>
            {status === "streaming"
              ? t("detail.generatingLive", { model: selectedModel })
              : t("detail.preparingContext")}
          </div>
        ) : null}
      </div>
      <h2 className="mt-5 text-xl font-semibold tracking-[-0.03em]">
        {t("detail.summarizeDocument")}
      </h2>
      <p className="mt-2 text-sm leading-6 text-[#8B8B95]">
        {t("detail.summarizeDescription")}
      </p>
      <label className="mt-5 block">
        <span className="text-xs font-medium text-[#D4D4D8]">
          {t("detail.model")}
        </span>
        <span className="relative mt-2 block">
          <select
            value={selectedModel}
            onChange={(event) => onModelChange(event.target.value)}
            disabled={isSummarizing}
            className="h-11 w-full appearance-none rounded-lg border border-white/10 bg-[#0B0B0D] px-3 pr-10 text-sm text-white outline-none transition-colors focus:border-[#2DD4BF]/50 focus-visible:ring-2 focus-visible:ring-[#2DD4BF]/25 disabled:cursor-not-allowed disabled:text-[#71717A]"
          >
            {models.map((model) => (
              <option key={model.id} value={model.id}>
                {model.label}
              </option>
            ))}
          </select>
          <CaretDown className="pointer-events-none absolute right-3 top-3.5 h-4 w-4 text-[#71717A]" />
        </span>
        <span className="mt-2 block text-xs leading-5 text-[#71717A]">
          {t(
            selectedModel === "deepseek-v4-flash"
              ? "detail.modelDescriptions.flash"
              : selectedModel === "deepseek-v4-pro"
                ? "detail.modelDescriptions.pro"
                : "detail.modelDescriptions.configured",
          )}
        </span>
      </label>
      <button
        type="button"
        onClick={isSummarizing ? stop : summarize}
        disabled={document.status !== "READY"}
        className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#2DD4BF] text-sm font-semibold text-[#04100E] transition duration-200 hover:bg-[#5EEAD4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#99F6E4] focus-visible:ring-offset-2 focus-visible:ring-offset-[#09100F] active:translate-y-px disabled:cursor-not-allowed disabled:bg-[#1F4F48] disabled:text-[#83A8A2]"
      >
        {isSummarizing ? (
          <X className="h-4 w-4" weight="bold" />
        ) : (
          <Sparkle className="h-4 w-4" weight="fill" />
        )}
        {isSummarizing
          ? t("detail.stopGenerating")
          : document.status === "READY"
            ? t("detail.generateSummary")
            : t("detail.availableAfterProcessing")}
      </button>
    </section>
  );
}
