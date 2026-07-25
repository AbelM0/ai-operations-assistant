"use client";

import {
  ArrowRight,
  ChatCenteredDots,
  Plus,
} from "@phosphor-icons/react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import type { WorkspaceDocument } from "@/lib/documents/types";
import type { ConversationSummary } from "@/lib/rag/types";
import { ConversationPanel } from "./conversation-panel";
import { DocumentList } from "./document-list";
import { FirstSourceGuide } from "./first-source-guide";
import { WorkspaceSummary } from "./workspace-summary";

type ActiveWorkspaceOverviewProps = {
  firstName: string;
  documents: WorkspaceDocument[];
  conversations: ConversationSummary[];
  conversationCount: number;
  showFirstUploadNextSteps: boolean;
  onUpload: () => void;
};

export function ActiveWorkspaceOverview({
  firstName,
  documents,
  conversations,
  conversationCount,
  showFirstUploadNextSteps,
  onUpload,
}: ActiveWorkspaceOverviewProps) {
  const { t } = useTranslation();
  const processingCount = documents.filter(
    (document) =>
      document.status !== "READY" && document.status !== "FAILED",
  ).length;
  const failedCount = documents.filter(
    (document) => document.status === "FAILED",
  ).length;

  return (
    <>
      <section className="flex flex-col gap-6 border-b border-white/8 pb-9 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-[#5EEAD4]">
            {showFirstUploadNextSteps
              ? t("workspace.firstSourceReceived")
              : t("workspace.dashboard")}
          </p>
          <h1 className="mt-3 text-balance text-[clamp(2.25rem,4.5vw,4rem)] font-medium leading-[1] tracking-[-0.05em] text-white">
            {showFirstUploadNextSteps
              ? t("workspace.firstUnderway")
              : t("workspace.greeting", { name: firstName })}
          </h1>
          <p className="mt-4 max-w-2xl text-pretty text-sm leading-6 text-[#A1A1AA] sm:text-base">
            {showFirstUploadNextSteps
              ? t("workspace.firstSourcePreparing")
              : processingCount > 0
                ? t("workspace.processingDescription", {
                    count: processingCount,
                  })
                : t("workspace.dashboardDescription")}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/workspace/ask"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-white/10 px-4 text-sm font-semibold text-[#D4D4D8] transition-colors hover:border-[#2DD4BF]/35 hover:bg-[#2DD4BF]/8 hover:text-white active:translate-y-px"
          >
            <ChatCenteredDots className="h-4 w-4" />
            {t("nav.askNexus")}
          </Link>
          <button
            type="button"
            onClick={onUpload}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#2DD4BF] px-4 text-sm font-semibold text-[#04100E] transition-colors hover:bg-[#5EEAD4] active:translate-y-px"
          >
            <Plus className="h-4 w-4" weight="bold" />
            {t("common.upload")}
          </button>
        </div>
      </section>

      {showFirstUploadNextSteps ? (
        <FirstSourceGuide document={documents[0]} />
      ) : null}

      <WorkspaceSummary
        documents={documents}
        conversationCount={conversationCount}
      />

      {failedCount > 0 ? (
        <Link
          href="/workspace/documents"
          className="mt-5 flex items-center justify-between gap-4 rounded-lg border border-red-400/15 bg-red-400/[0.045] px-4 py-3 text-sm text-red-200 transition-colors hover:bg-red-400/[0.07]"
        >
          <span>{t("workspace.failedAttention", { count: failedCount })}</span>
          <ArrowRight className="h-4 w-4 shrink-0" />
        </Link>
      ) : null}

      <div className="mt-5 grid items-start gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(19rem,0.65fr)]">
        <DocumentList documents={documents} />
        <ConversationPanel conversations={conversations} />
      </div>
    </>
  );
}
