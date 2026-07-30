"use client";

import { ArrowUp, FileText, X } from "@phosphor-icons/react";
import { useTranslation } from "react-i18next";
import type { AskNexusController } from "./use-ask-nexus";

export function ChatComposer({
  controller,
}: {
  controller: AskNexusController;
}) {
  const { t } = useTranslation();
  const {
    error,
    selectedIds,
    draft,
    isResponding,
    clearError,
    setSelectorOpen,
    setDraft,
    sendQuestion,
    submit,
    stop,
  } = controller;

  return (
    <div className="sticky bottom-0 bg-[linear-gradient(to_top,#050505_82%,transparent)] pb-5 pt-8">
      <form onSubmit={submit} className="mx-auto max-w-3xl">
        {error ? (
          <div
            role="alert"
            className="mb-3 flex items-start justify-between gap-3 rounded-lg border border-red-400/15 bg-red-400/[0.05] px-3 py-2.5 text-xs leading-5 text-red-200"
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
        {selectedIds.length === 0 ? (
          <button
            type="button"
            onClick={() => setSelectorOpen(true)}
            className="mb-2 text-xs font-medium text-amber-300 hover:text-amber-200"
          >
            {t("chat.selectDocument")}
          </button>
        ) : null}
        <div className="rounded-xl border border-white/12 bg-[#111113] p-2 shadow-[0_18px_60px_rgba(0,0,0,0.35)] focus-within:border-[#2DD4BF]/45">
          <label htmlFor="nexus-question" className="sr-only">
            {t("chat.questionLabel")}
          </label>
          <textarea
            id="nexus-question"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                sendQuestion();
              }
            }}
            rows={2}
            placeholder={t("chat.questionPlaceholder")}
            className="max-h-40 min-h-14 w-full resize-none bg-transparent px-3 py-2 text-sm leading-6 text-white outline-none placeholder:text-[#5E5E66]"
          />
          <div className="flex items-center justify-between gap-3 px-1 pb-1">
            <button
              type="button"
              onClick={() => setSelectorOpen(true)}
              className="inline-flex h-8 items-center gap-2 rounded-md px-2 text-xs text-[#8B8B95] hover:bg-white/5 hover:text-white"
            >
              <FileText className="h-3.5 w-3.5" />
              {t("chat.selected", { count: selectedIds.length })}
            </button>
            {isResponding ? (
              <button
                type="button"
                onClick={stop}
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#E4E4E7] text-[#09090B] hover:bg-white active:translate-y-px"
                aria-label={t("chat.stop")}
              >
                <X className="h-4 w-4" weight="bold" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={!draft.trim() || selectedIds.length === 0}
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#2DD4BF] text-[#04100E] transition-colors hover:bg-[#5EEAD4] active:translate-y-px disabled:cursor-not-allowed disabled:bg-[#263B38] disabled:text-[#718984]"
                aria-label={t("chat.send")}
              >
                <ArrowUp className="h-4 w-4" weight="bold" />
              </button>
            )}
          </div>
        </div>
        <p className="mt-2 text-center text-[10px] text-[#52525B]">
          {t("chat.verification")}
        </p>
      </form>
    </div>
  );
}
