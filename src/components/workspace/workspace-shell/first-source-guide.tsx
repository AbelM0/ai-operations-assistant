"use client";

import {
  ArrowUpRight,
  CheckCircle,
  Lightning,
} from "@phosphor-icons/react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import type { WorkspaceDocument } from "@/lib/documents/types";

export function FirstSourceGuide({
  document,
}: {
  document: WorkspaceDocument;
}) {
  const { t } = useTranslation();
  const isReady = document.status === "READY";

  return (
    <section
      aria-labelledby="next-steps-heading"
      className="mt-6 grid gap-5 rounded-xl border border-[#2DD4BF]/18 bg-[#0B1110] p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center"
    >
      <div>
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#2DD4BF]/10 text-[#5EEAD4]">
            {isReady ? (
              <CheckCircle className="h-4.5 w-4.5" weight="fill" />
            ) : (
              <Lightning className="h-4.5 w-4.5" weight="duotone" />
            )}
          </span>
          <div>
            <p className="font-mono text-[9px] uppercase tracking-[0.15em] text-[#5EEAD4]">
              {t(
                isReady
                  ? "workspace.firstSource.stepComplete"
                  : "workspace.firstSource.stepProgress",
              )}
            </p>
            <h2
              id="next-steps-heading"
              className="mt-1 text-base font-semibold tracking-[-0.02em] text-white"
            >
              {isReady
                ? t("workspace.firstSource.readyTitle")
                : t("workspace.firstSource.preparingTitle")}
            </h2>
          </div>
        </div>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-[#7E8C89]">
          {isReady
            ? t("workspace.firstSource.readyBody")
            : t("workspace.firstSource.preparingBody", {
                name: document.originalName,
              })}
        </p>
      </div>
      <Link
        href={`/workspace/documents/${document.id}`}
        className="inline-flex h-10 w-fit items-center gap-2 rounded-lg border border-[#2DD4BF]/25 px-4 text-xs font-semibold text-[#D4D4D8] transition-colors hover:bg-[#2DD4BF]/8 hover:text-white"
      >
        {t("workspace.firstSource.view")}
        <ArrowUpRight className="h-3.5 w-3.5" weight="bold" />
      </Link>
    </section>
  );
}
