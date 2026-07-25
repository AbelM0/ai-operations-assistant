"use client";

import {
  ArrowRight,
  ChatCenteredDots,
  FileText,
  House,
  MagnifyingGlass,
} from "@phosphor-icons/react";
import Link from "next/link";
import { useTranslation } from "react-i18next";

const navItems = [
  {
    label: "nav.overview",
    icon: House,
    href: "/workspace",
    active: true,
  },
  {
    label: "nav.documents",
    icon: FileText,
    href: "/workspace/documents",
    active: false,
  },
  {
    label: "nav.askNexus",
    icon: ChatCenteredDots,
    href: "/workspace/ask",
    active: false,
  },
];

type WorkspaceNavProps = {
  documentCount: number;
  onUpload: () => void;
};

export function WorkspaceNav({
  documentCount,
  onUpload,
}: WorkspaceNavProps) {
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
        {navItems.map(({ label, icon: Icon, href, active }) => (
          <Link
            key={label}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
              active
                ? "bg-[#2DD4BF]/10 text-[#5EEAD4]"
                : "text-[#8B8B95] hover:bg-white/5 hover:text-white"
            }`}
          >
            <Icon
              className="h-4 w-4"
              weight={active ? "fill" : "regular"}
            />
            {t(label)}
          </Link>
        ))}
      </nav>

      <div className="mt-auto rounded-xl border border-white/8 bg-[#0D0D0F] p-4">
        {documentCount > 0 ? (
          <>
            <MagnifyingGlass className="h-4 w-4 text-[#5EEAD4]" />
            <p className="mt-3 text-xs leading-5 text-[#71717A]">
              {t("workspace.libraryCount", { count: documentCount })}
            </p>
          </>
        ) : (
          <p className="text-xs leading-5 text-[#71717A]">
            {t("workspace.emptyLibraryHint")}
          </p>
        )}
        <button
          type="button"
          onClick={onUpload}
          className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-[#D4D4D8] hover:text-white"
        >
          {t("documents.uploadDocument")}
          <ArrowRight className="h-3.5 w-3.5" weight="bold" />
        </button>
      </div>
    </>
  );
}
