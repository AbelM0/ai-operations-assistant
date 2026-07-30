"use client";

import { useTranslation } from "react-i18next";

export function StatusLabel({ status }: { status: string }) {
  const { t } = useTranslation();
  const normalized = status.replaceAll("_", " ").toLowerCase();
  const isReady = status === "READY";
  const isFailed = status === "FAILED";

  return (
    <span
      className={`w-fit rounded-md border px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.1em] ${
        isReady
          ? "border-[#2DD4BF]/25 bg-[#2DD4BF]/8 text-[#5EEAD4]"
          : isFailed
            ? "border-red-400/20 bg-red-400/8 text-red-300"
            : "border-white/10 bg-white/5 text-[#A1A1AA]"
      }`}
    >
      {t(`documents.status.${status.replace("OCR_", "").toLowerCase()}`, {
        defaultValue: normalized,
      })}
    </span>
  );
}
