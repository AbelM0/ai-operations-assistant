"use client";

import { ArrowUp, ChatCenteredDots } from "@phosphor-icons/react";
import { useTranslation } from "react-i18next";
import type { WorkspaceDocument } from "@/lib/documents/types";
import { DocumentPicker } from "./document-picker";

type DocumentSetupProps = {
  documents: WorkspaceDocument[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  onStart: () => void;
};

export function DocumentSetup({
  documents,
  selectedIds,
  onToggle,
  onStart,
}: DocumentSetupProps) {
  const { t } = useTranslation();

  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-7 sm:py-14 lg:px-10">
      <div className="max-w-2xl">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#2DD4BF]/20 bg-[#09100F] text-[#5EEAD4]">
          <ChatCenteredDots className="h-5 w-5" weight="fill" />
        </span>
        <h1 className="mt-6 text-[clamp(2.25rem,5vw,4.25rem)] font-medium leading-[1] tracking-[-0.05em]">
          {t("chat.chooseTitle")}
        </h1>
        <p className="mt-4 max-w-xl text-base leading-7 text-[#A1A1AA]">
          {t("chat.chooseDescription")}
        </p>
      </div>
      <div className="mt-9 overflow-hidden rounded-xl border border-white/10 bg-[#0B0B0D]">
        <DocumentPicker
          documents={documents}
          selectedIds={selectedIds}
          onToggle={onToggle}
        />
        <div className="flex flex-col gap-3 border-t border-white/8 bg-[#08080A] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p className="text-xs text-[#71717A]">
            {selectedIds.length
              ? t("chat.documentContext", { count: selectedIds.length })
              : t("chat.selectReadyDocument")}
          </p>
          <button
            type="button"
            onClick={onStart}
            disabled={selectedIds.length === 0}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#2DD4BF] px-5 text-sm font-semibold text-[#04100E] hover:bg-[#5EEAD4] active:translate-y-px disabled:cursor-not-allowed disabled:bg-[#263B38] disabled:text-[#718984]"
          >
            {t("chat.start")}
            <ArrowUp className="h-4 w-4 rotate-90" weight="bold" />
          </button>
        </div>
      </div>
    </section>
  );
}
