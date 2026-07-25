"use client";

import {
  ChatCenteredDots,
  FileText,
  FolderSimple,
  Lightning,
  Plus,
  Receipt,
} from "@phosphor-icons/react";
import { useTranslation } from "react-i18next";
import { DocumentUpload } from "../document-upload";
import type { DocumentUploadedHandler } from "./types";

const workflow = [
  { key: "add", icon: Plus },
  { key: "index", icon: Lightning },
  { key: "review", icon: FileText },
  { key: "ask", icon: ChatCenteredDots },
] as const;

const guidance = [
  { key: "invoices", icon: FileText },
  { key: "receipts", icon: Receipt },
  { key: "business", icon: FolderSimple },
] as const;

type NewUserOverviewProps = {
  firstName: string;
  onUploaded: DocumentUploadedHandler;
};

export function NewUserOverview({
  firstName,
  onUploaded,
}: NewUserOverviewProps) {
  const { t } = useTranslation();

  return (
    <>
      <section className="grid gap-8 border-b border-white/8 pb-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <div className="max-w-3xl">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-[#5EEAD4]">
            {t("workspace.setup")}
          </p>
          <h1 className="mt-4 text-balance text-[clamp(2.5rem,5vw,4.75rem)] font-medium leading-[0.98] tracking-[-0.05em] text-white">
            {t("workspace.startWithDocument", { name: firstName })}
          </h1>
          <p className="mt-5 max-w-2xl text-pretty text-base leading-7 text-[#A1A1AA] sm:text-lg">
            {t("workspace.setupDescription")}
          </p>
        </div>
        <div className="hidden items-center gap-3 font-mono text-[9px] uppercase tracking-[0.14em] text-[#71717A] sm:flex">
          <span className="h-px w-12 bg-[#2DD4BF]/45" />
          {t("workspace.aboutTwoMinutes")}
        </div>
      </section>

      <div className="mt-8 grid items-start gap-5 xl:grid-cols-[minmax(20rem,0.72fr)_minmax(0,1.28fr)]">
        <section
          aria-labelledby="workflow-guide-heading"
          className="overflow-hidden rounded-xl border border-[#2DD4BF]/18 bg-[#0B1110]"
        >
          <div className="border-b border-white/8 px-5 py-5 sm:px-6">
            <p className="font-mono text-[9px] uppercase tracking-[0.15em] text-[#5EEAD4]">
              {t("workspace.firstWorkflow")}
            </p>
            <h2
              id="workflow-guide-heading"
              className="mt-2 text-xl font-semibold tracking-[-0.03em] text-white"
            >
              {t("workspace.uploadToAnswer")}
            </h2>
          </div>
          <ol className="px-5 py-2 sm:px-6">
            {workflow.map(({ key, icon: Icon }, index) => (
              <li
                key={key}
                className="relative grid grid-cols-[2.5rem_1fr] gap-4 border-b border-white/7 py-5 last:border-0"
              >
                {index < workflow.length - 1 ? (
                  <span className="absolute bottom-[-1.25rem] left-[1.22rem] top-[3.5rem] w-px bg-white/8" />
                ) : null}
                <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-[#101715] text-[#5EEAD4]">
                  <Icon className="h-4.5 w-4.5" weight="duotone" />
                </span>
                <div className="pt-0.5">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-[#E4E4E7]">
                      {t(`workspace.workflow.${key}.title`)}
                    </p>
                    <span className="font-mono text-[9px] text-[#52706B]">
                      0{index + 1}
                    </span>
                  </div>
                  <p className="mt-1.5 text-xs leading-5 text-[#7E8C89]">
                    {t(`workspace.workflow.${key}.body`)}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </section>
        <DocumentUpload onUploaded={onUploaded} />
      </div>

      <section
        aria-labelledby="guidance-heading"
        className="mt-5 grid gap-5 rounded-xl border border-white/8 bg-[#0B0B0D] p-5 sm:p-6 lg:grid-cols-[0.72fr_1.28fr] lg:items-center"
      >
        <div>
          <h2
            id="guidance-heading"
            className="text-lg font-semibold tracking-[-0.025em] text-white"
          >
            {t("workspace.chooseFirstSource")}
          </h2>
          <p className="mt-2 max-w-sm text-sm leading-6 text-[#71717A]">
            {t("workspace.chooseFirstSourceHint")}
          </p>
        </div>
        <div className="grid gap-px overflow-hidden rounded-lg border border-white/8 bg-white/8 md:grid-cols-3">
          {guidance.map(({ key, icon: Icon }) => (
            <article
              key={key}
              className="bg-[#0E0E11] p-4 transition-colors hover:bg-[#121216]"
            >
              <Icon className="h-5 w-5 text-[#5EEAD4]" weight="duotone" />
              <h3 className="mt-4 text-sm font-semibold text-white">
                {t(`workspace.guidance.${key}.title`)}
              </h3>
              <p className="mt-2 text-xs leading-5 text-[#8B8B95]">
                {t(`workspace.guidance.${key}.body`)}
              </p>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
