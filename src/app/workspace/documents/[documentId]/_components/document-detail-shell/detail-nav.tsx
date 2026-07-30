"use client";

import {
  ChatCenteredDots,
  FileText,
  House,
  Sparkle,
} from "@phosphor-icons/react";
import Link from "next/link";
import { useTranslation } from "react-i18next";

export function DetailNav() {
  const { t } = useTranslation();

  return (
    <>
      <Link
        href="/"
        className="flex w-fit items-center gap-2.5 px-2"
        aria-label={t("nav.homeAria")}
      >
        <span className="h-2.5 w-2.5 rounded-full bg-[#2DD4BF] shadow-[0_0_18px_rgba(45,212,191,0.65)]" />
        <span className="text-sm font-semibold tracking-[0.17em]">
          NEXUS<span className="text-[#71717A]">/OPS</span>
        </span>
      </Link>
      <nav
        className="mt-10 space-y-1"
        aria-label={t("nav.workspaceNavigation")}
      >
        <Link
          href="/workspace"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[#8B8B95] hover:bg-white/5 hover:text-white"
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
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[#8B8B95] hover:bg-white/5 hover:text-white"
        >
          <ChatCenteredDots className="h-4 w-4" />
          {t("nav.askNexus")}
        </Link>
      </nav>
      <div className="mt-auto rounded-xl border border-white/8 bg-[#0D0D0F] p-4">
        <Sparkle className="h-4 w-4 text-[#5EEAD4]" />
        <p className="mt-3 text-xs leading-5 text-[#71717A]">
          {t("detail.navHint")}
        </p>
      </div>
    </>
  );
}
