"use client";

import {
  ArrowLeft,
  ArrowRight,
  ArrowSquareOut,
  Check,
  Copy,
  FileText,
  WarningCircle,
} from "@phosphor-icons/react";
import Link from "next/link";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { RagSource } from "@/lib/rag/types";

export type ActiveEvidence = {
  sourceId: string;
  sources: RagSource[];
  messageId?: string;
};

function documentHref(source: RagSource, messageId?: string) {
  const params = new URLSearchParams();
  if (source.pageStart) params.set("page", String(source.pageStart));
  params.set("source", source.id);
  if (messageId) params.set("message", messageId);
  const query = params.toString();
  return `/workspace/documents/${source.documentId}${query ? `?${query}` : ""}`;
}

export function EvidenceDrawer({
  evidence,
  onEvidenceChange,
}: {
  evidence: ActiveEvidence | null;
  onEvidenceChange: (evidence: ActiveEvidence | null) => void;
}) {
  const { t } = useTranslation();
  const titleRef = useRef<HTMLHeadingElement | null>(null);
  const [copyStatus, setCopyStatus] = useState<"idle" | "success" | "error">(
    "idle",
  );
  const sourceIndex = evidence
    ? evidence.sources.findIndex((source) => source.id === evidence.sourceId)
    : -1;
  const source = sourceIndex >= 0 ? evidence?.sources[sourceIndex] : undefined;

  const selectSource = (index: number) => {
    if (!evidence) return;
    const nextSource = evidence.sources[index];
    if (!nextSource) return;
    setCopyStatus("idle");
    onEvidenceChange({ ...evidence, sourceId: nextSource.id });
  };

  const copyPassage = async () => {
    if (!source?.excerpt) return;
    try {
      await navigator.clipboard.writeText(source.excerpt);
      setCopyStatus("success");
    } catch {
      setCopyStatus("error");
    }
  };

  const pageLabel = source?.pageStart
    ? source.pageEnd && source.pageEnd !== source.pageStart
      ? `${source.pageStart}–${source.pageEnd}`
      : String(source.pageStart)
    : null;

  return (
    <Sheet
      open={Boolean(source)}
      onOpenChange={(open) => {
        if (!open) {
          setCopyStatus("idle");
          onEvidenceChange(null);
        }
      }}
    >
      <SheetContent
        side="responsive"
        initialFocus={titleRef}
        className="max-h-[86dvh] w-full gap-0 overflow-hidden rounded-t-xl border-white/10 bg-[#080A0A] text-white shadow-2xl shadow-black/60 sm:max-h-none sm:w-[min(30rem,42vw)] sm:rounded-none"
      >
        {source ? (
          <>
            <SheetHeader className="border-b border-white/8 px-5 pb-4 pt-5 pr-14 sm:px-6 sm:pt-6">
              <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-[#5EEAD4]">
                {t("chat.evidence.usedToSupport")}
              </p>
              <SheetTitle
                ref={titleRef}
                tabIndex={-1}
                className="mt-2 flex items-center gap-2 text-base font-semibold text-white outline-none"
              >
                <span className="font-mono text-[#5EEAD4]">[{source.id}]</span>
                {t("chat.evidence.title")}
              </SheetTitle>
              <SheetDescription className="sr-only">
                {t("chat.evidence.description", { source: source.id })}
              </SheetDescription>
            </SheetHeader>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5 sm:px-6">
              <div className="flex items-start gap-3 border-b border-white/8 pb-5">
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#2DD4BF]/20 bg-[#2DD4BF]/8 text-[#5EEAD4]">
                  <FileText className="h-4 w-4" weight="duotone" />
                </span>
                <div className="min-w-0">
                  <p className="break-words text-sm font-medium leading-5 text-[#F4F4F5]">
                    {source.documentName}
                  </p>
                  {pageLabel ? (
                    <p className="mt-1 font-mono text-[10px] text-[#7D8583]">
                      {t("chat.evidence.page", { page: pageLabel })}
                    </p>
                  ) : null}
                </div>
              </div>

              <section aria-labelledby="evidence-passage-heading" className="pt-5">
                <h3
                  id="evidence-passage-heading"
                  className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#7D8583]"
                >
                  {t("chat.evidence.passage")}
                </h3>
                {source.excerpt ? (
                  <blockquote className="mt-3 whitespace-pre-line border-l-2 border-[#2DD4BF]/45 pl-4 text-[13px] leading-6 text-[#C9CECC] sm:text-sm">
                    {source.excerpt}
                  </blockquote>
                ) : (
                  <div className="mt-3 flex gap-2.5 rounded-lg border border-amber-200/10 bg-amber-200/[0.035] p-3 text-xs leading-5 text-[#B8B2A4]">
                    <WarningCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    <p>{t("chat.evidence.unavailable")}</p>
                  </div>
                )}
              </section>

              <div className="mt-6 grid gap-2 sm:grid-cols-2">
                <Link
                  href={documentHref(source, evidence?.messageId)}
                  className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-[#DDFBF5] px-3 text-xs font-semibold text-[#08211C] transition-colors hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5EEAD4] active:translate-y-px"
                >
                  <ArrowSquareOut className="h-4 w-4" />
                  {t("chat.evidence.openInDocument")}
                </Link>
                <button
                  type="button"
                  onClick={() => void copyPassage()}
                  disabled={!source.excerpt}
                  className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-white/10 px-3 text-xs font-medium text-[#D4D4D8] transition-colors hover:border-[#2DD4BF]/35 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5EEAD4] active:translate-y-px disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {copyStatus === "success" ? (
                    <Check className="h-4 w-4 text-[#5EEAD4]" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                  {copyStatus === "success"
                    ? t("chat.evidence.copied")
                    : t("chat.evidence.copyPassage")}
                </button>
              </div>
              <p className="sr-only" role="status" aria-live="polite">
                {copyStatus === "success"
                  ? t("chat.evidence.copySuccess")
                  : copyStatus === "error"
                    ? t("chat.evidence.copyError")
                    : ""}
              </p>
              {copyStatus === "error" ? (
                <p className="mt-2 text-xs text-red-300" role="alert">
                  {t("chat.evidence.copyError")}
                </p>
              ) : null}
            </div>

            <footer className="flex items-center justify-between gap-3 border-t border-white/8 bg-[#090C0B] px-5 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-6 sm:pb-3">
              <p className="font-mono text-[10px] tabular-nums text-[#7D8583]">
                {t("chat.evidence.position", {
                  current: sourceIndex + 1,
                  total: evidence?.sources.length ?? 0,
                })}
              </p>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => selectSource(sourceIndex - 1)}
                  disabled={sourceIndex <= 0}
                  aria-label={t("chat.evidence.previous")}
                  className="flex h-9 w-9 items-center justify-center rounded-md border border-white/10 text-[#A1A1AA] hover:border-[#2DD4BF]/30 hover:text-white focus-visible:outline-2 focus-visible:outline-[#5EEAD4] disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => selectSource(sourceIndex + 1)}
                  disabled={sourceIndex >= (evidence?.sources.length ?? 0) - 1}
                  aria-label={t("chat.evidence.next")}
                  className="flex h-9 w-9 items-center justify-center rounded-md border border-white/10 text-[#A1A1AA] hover:border-[#2DD4BF]/30 hover:text-white focus-visible:outline-2 focus-visible:outline-[#5EEAD4] disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </footer>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
