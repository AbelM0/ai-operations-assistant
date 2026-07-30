"use client";

import {
  ChatCenteredDots,
  FileText,
  House,
  Plus,
} from "@phosphor-icons/react";
import Link from "next/link";
import { useTranslation } from "react-i18next";

type DocumentsNavProps = {
  documentCount: number;
  onUpload: () => void;
};

export function DocumentsNav({
  documentCount,
  onUpload,
}: DocumentsNavProps) {
  const { t } = useTranslation();

  return (
    <>
      <Link
        href="/"
        className="flex w-fit items-center gap-2.5 px-2"
        aria-label={t("nav.homeAria")}
      >
        <span className="h-2.5 w-2.5 rounded-full bg-[#2DD4BF] shadow-[0_0_18px_rgba(45,212,191,0.65)]" />
        <span className="text-sm font-semibold tracking-[0.17em] text-white">
          NEXUS<span className="text-[#71717A]">/OPS</span>
        </span>
      </Link>
      <nav
        aria-label={t("nav.workspaceNavigation")}
        className="mt-10 space-y-1"
      >
        <Link
          href="/workspace"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[#8B8B95] transition-colors hover:bg-white/5 hover:text-white"
        >
          <House className="h-4 w-4" />
          {t("nav.overview")}
        </Link>
        <Link
          href="/workspace/documents"
          aria-current="page"
          className="flex items-center gap-3 rounded-lg bg-[#2DD4BF]/10 px-3 py-2.5 text-sm text-[#5EEAD4]"
        >
          <FileText className="h-4 w-4" weight="fill" />
          {t("nav.documents")}
        </Link>
        <Link
          href="/workspace/ask"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[#8B8B95] transition-colors hover:bg-white/5 hover:text-white"
        >
          <ChatCenteredDots className="h-4 w-4" />
          {t("nav.askNexus")}
        </Link>
      </nav>
      <div className="mt-auto rounded-xl border border-white/8 bg-[#0D0D0F] p-4">
        <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#5EEAD4]">
          {t("documents.stored", { count: documentCount })}
        </p>
        <p className="mt-2 text-xs leading-5 text-[#71717A]">
          {t("documents.storedHint")}
        </p>
        <button
          type="button"
          onClick={onUpload}
          className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-[#D4D4D8] hover:text-white"
        >
          <Plus className="h-3.5 w-3.5" />
          {t("documents.uploadDocument")}
        </button>
      </div>
    </>
  );
}
