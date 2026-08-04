"use client";

import {
  ArrowRight,
  ChatCenteredDots,
  FileMagnifyingGlass,
  WarningCircle,
} from "@phosphor-icons/react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import type { WorkspaceDocument } from "@/lib/documents/types";

export function OperationsPanel({
  documents,
  expenseAttentionCount,
}: {
  documents: WorkspaceDocument[];
  expenseAttentionCount: number;
}) {
  const { t } = useTranslation();
  const readyCount = documents.filter(
    (document) => document.status === "READY",
  ).length;
  const reviewCount = documents.filter((document) =>
    ["SUGGESTED", "NEEDS_REVIEW"].includes(
      document.extraction?.reviewStatus ?? "",
    ),
  ).length;
  const actions = [
    {
      href: "/workspace/documents",
      icon: FileMagnifyingGlass,
      label: t("workspace.operations.extractionReview"),
      detail: t(
        reviewCount > 0
          ? "workspace.operations.extractionReviewPending"
          : "workspace.operations.extractionReviewClear",
        { count: reviewCount },
      ),
      count: reviewCount,
      warning: reviewCount > 0,
    },
    {
      href: "/workspace/expenses",
      icon: WarningCircle,
      label: t("workspace.operations.expenseReview"),
      detail: t(
        expenseAttentionCount > 0
          ? "workspace.operations.expenseReviewPending"
          : "workspace.operations.expenseReviewClear",
        { count: expenseAttentionCount },
      ),
      count: expenseAttentionCount,
      warning: expenseAttentionCount > 0,
    },
    {
      href: "/workspace/ask",
      icon: ChatCenteredDots,
      label: t("workspace.operations.readyToAsk"),
      detail: t("workspace.operations.readyToAskDetail", {
        count: readyCount,
      }),
      count: readyCount,
      warning: false,
    },
  ];

  return (
    <aside className="overflow-hidden rounded-xl border border-white/10 bg-[#0B0B0D]">
      <header className="border-b border-white/8 px-5 py-5">
        <p className="font-mono text-[9px] uppercase tracking-[0.15em] text-[#5EEAD4]">
          {t("workspace.operations.eyebrow")}
        </p>
        <h2 className="mt-2 text-lg font-semibold tracking-[-0.025em] text-white">
          {t("workspace.operations.title")}
        </h2>
        <p className="mt-1 text-xs leading-5 text-[#71717A]">
          {t("workspace.operations.description")}
        </p>
      </header>

      <div className="divide-y divide-white/7">
        {actions.map(({ href, icon: Icon, label, detail, count, warning }) => (
          <Link
            key={href}
            href={href}
            className="group grid grid-cols-[2.25rem_minmax(0,1fr)_auto] items-center gap-3 px-5 py-4 transition-colors hover:bg-white/[0.035]"
          >
            <span
              className={`flex h-9 w-9 items-center justify-center rounded-lg border ${
                warning
                  ? "border-amber-300/15 bg-amber-300/[0.055] text-amber-200"
                  : "border-[#2DD4BF]/15 bg-[#2DD4BF]/[0.055] text-[#5EEAD4]"
              }`}
            >
              <Icon className="h-4 w-4" weight="duotone" />
            </span>
            <span className="min-w-0">
              <span className="block text-xs font-semibold text-[#D4D4D8] group-hover:text-white">
                {label}
              </span>
              <span className="mt-1 block truncate text-[10px] text-[#71717A]">
                {detail}
              </span>
            </span>
            <span className="flex items-center gap-2">
              <span className="font-mono text-sm tabular-nums text-[#E4E4E7]">
                {count}
              </span>
              <ArrowRight className="h-3.5 w-3.5 text-[#52525B] transition-transform group-hover:translate-x-0.5 group-hover:text-[#5EEAD4]" />
            </span>
          </Link>
        ))}
      </div>
    </aside>
  );
}
