"use client";

import {
  Check,
  FilePdf,
  FileText,
  MagnifyingGlass,
} from "@phosphor-icons/react";
import Link from "next/link";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { WorkspaceDocument } from "@/lib/documents/types";

type DocumentPickerProps = {
  documents: WorkspaceDocument[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  compact?: boolean;
};

export function DocumentPicker({
  documents,
  selectedIds,
  onToggle,
  compact = false,
}: DocumentPickerProps) {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const filtered = documents.filter((document) =>
    document.originalName.toLowerCase().includes(query.toLowerCase()),
  );
  const readyCount = documents.filter(
    (document) => document.status === "READY",
  ).length;

  return (
    <div className={compact ? "min-h-0" : ""}>
      <div className="flex flex-col gap-3 border-b border-white/8 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <h2 className="text-sm font-semibold text-white">
            {t("chat.workspaceDocuments")}
          </h2>
          <p className="mt-1 text-xs text-[#71717A]">
            {t("chat.readyForQuestions", { count: readyCount })}
          </p>
        </div>
        <label className="relative block sm:w-64">
          <MagnifyingGlass className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-[#5E5E66]" />
          <span className="sr-only">{t("chat.searchDocuments")}</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t("chat.searchDocuments")}
            className="h-9 w-full rounded-lg border border-white/10 bg-[#111113] pl-9 pr-3 text-xs text-white outline-none placeholder:text-[#5E5E66] focus:border-[#2DD4BF]/45"
          />
        </label>
      </div>
      <div
        className={`${compact ? "max-h-[55dvh]" : "max-h-[27rem]"} overflow-y-auto p-2`}
      >
        {filtered.length ? (
          filtered.map((document) => {
            const selectable = document.status === "READY";
            const selected = selectedIds.includes(document.id);
            const Icon =
              document.mimeType === "application/pdf" ? FilePdf : FileText;

            return (
              <button
                key={document.id}
                type="button"
                disabled={!selectable}
                onClick={() => onToggle(document.id)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left transition-colors ${
                  selected
                    ? "bg-[#2DD4BF]/9"
                    : selectable
                      ? "hover:bg-white/[0.035]"
                      : "cursor-not-allowed opacity-45"
                }`}
              >
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                    selected
                      ? "bg-[#2DD4BF]/12 text-[#5EEAD4]"
                      : "bg-white/5 text-[#8B8B95]"
                  }`}
                >
                  <Icon className="h-5 w-5" weight="duotone" />
                </span>
                <span className="min-w-0 flex-1">
                  <span
                    className={`block truncate text-sm font-medium ${
                      selected ? "text-white" : "text-[#D4D4D8]"
                    }`}
                  >
                    {document.originalName}
                  </span>
                  <span className="mt-1 block text-[11px] text-[#71717A]">
                    {selectable
                      ? t("chat.readyToUse")
                      : t(
                          `documents.status.${document.status
                            .replace("OCR_", "")
                            .toLowerCase()}`,
                          {
                            defaultValue: document.status
                              .replaceAll("_", " ")
                              .toLowerCase(),
                          },
                        )}
                  </span>
                </span>
                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
                    selected
                      ? "border-[#2DD4BF] bg-[#2DD4BF] text-[#04100E]"
                      : "border-white/15 text-transparent"
                  }`}
                >
                  <Check className="h-3 w-3" weight="bold" />
                </span>
              </button>
            );
          })
        ) : (
          <div className="flex min-h-40 flex-col items-center justify-center px-6 text-center">
            {documents.length === 0 ? (
              <FileText className="h-6 w-6 text-[#3F3F46]" />
            ) : (
              <MagnifyingGlass className="h-6 w-6 text-[#3F3F46]" />
            )}
            <p className="mt-3 text-sm text-[#8B8B95]">
              {documents.length === 0
                ? t("chat.emptyWorkspace")
                : t("chat.noSearchResults")}
            </p>
            {documents.length === 0 ? (
              <Link
                href="/workspace/documents"
                className="mt-3 text-xs font-semibold text-[#5EEAD4] hover:text-[#99F6E4]"
              >
                {t("documents.uploadDocument")}
              </Link>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
