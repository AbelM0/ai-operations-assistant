"use client";

import { UserButton } from "@clerk/nextjs";
import {
  ArrowClockwise,
  ArrowLeft,
  ArrowSquareOut,
  CaretDown,
  ChatCenteredDots,
  DownloadSimple,
  FileCsv,
  FilePdf,
  FileText,
  House,
  SidebarSimple,
  Sparkle,
  SpinnerGap,
  Trash,
  WarningCircle,
  X,
} from "@phosphor-icons/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import type { SummaryModelOption } from "@/lib/ai/models";
import type {
  DocumentSummary,
  WorkspaceDocumentDetail,
} from "@/lib/documents/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const processingStatuses = [
  "UPLOADED",
  "OCR_PROCESSING",
  "OCR_COMPLETED",
  "CHUNKING",
  "EMBEDDING",
];

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(new Date(value));
}

function SummaryContent({ value }: { value: string }) {
  const blocks = useMemo(() => value.split("\n"), [value]);
  return (
    <div className="space-y-3 text-sm leading-7 text-[#D4D4D8] sm:text-[15px]">
      {blocks.map((line, index) => {
        const key = `${index}-${line.slice(0, 20)}`;
        if (!line.trim()) return <div key={key} className="h-1" />;
        if (/^#{1,3}\s/.test(line))
          return (
            <h3
              key={key}
              className="pt-3 text-base font-semibold tracking-[-0.02em] text-white"
            >
              {line.replace(/^#{1,3}\s/, "")}
            </h3>
          );
        if (/^[-*]\s/.test(line))
          return (
            <p key={key} className="grid grid-cols-[0.7rem_1fr] gap-2">
              <span className="mt-[0.68rem] h-1 w-1 rounded-full bg-[#2DD4BF]" />
              <span>{line.replace(/^[-*]\s/, "").replace(/\*\*/g, "")}</span>
            </p>
          );
        return <p key={key}>{line.replace(/\*\*/g, "")}</p>;
      })}
    </div>
  );
}

export function DocumentDetailShell({
  initialDocument,
  models,
  defaultModel,
}: {
  initialDocument: WorkspaceDocumentDetail;
  models: SummaryModelOption[];
  defaultModel: string;
}) {
  const router = useRouter();
  const [document, setDocument] = useState(initialDocument);
  const [selectedModel, setSelectedModel] = useState(defaultModel);
  const [selectedSummaryId, setSelectedSummaryId] = useState(
    initialDocument.summaries[0]?.id || "",
  );
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const currentSummary =
    document.summaries.find((summary) => summary.id === selectedSummaryId) ||
    document.summaries[0];

  useEffect(() => {
    if (!processingStatuses.includes(document.status)) return;
    let cancelled = false;
    const refresh = async () => {
      const response = await fetch(`/api/documents/${document.id}`, {
        cache: "no-store",
      });
      if (!response.ok || cancelled) return;
      const payload = (await response.json()) as {
        document: WorkspaceDocumentDetail;
      };
      if (!cancelled) setDocument(payload.document);
    };
    const interval = window.setInterval(() => void refresh(), 2500);
    void refresh();
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [document.id, document.status]);

  const summarize = async () => {
    if (isSummarizing || document.status !== "READY") return;
    setIsSummarizing(true);
    try {
      const response = await fetch(`/api/documents/${document.id}/summary`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: selectedModel }),
      });
      const payload = (await response.json().catch(() => ({}))) as {
        summary?: DocumentSummary;
        error?: string;
      };
      if (!response.ok || !payload.summary)
        throw new Error(payload.error || "The summary could not be generated.");
      setDocument((current) => ({
        ...current,
        summaries: [payload.summary!, ...current.summaries],
      }));
      setSelectedSummaryId(payload.summary.id);
      toast.success("Summary ready", {
        description: "You can now review or export it.",
      });
    } catch (error) {
      toast.error("Summary not generated", {
        description:
          error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setIsSummarizing(false);
    }
  };

  const retry = async () => {
    setIsRetrying(true);
    try {
      const response = await fetch(`/api/documents/${document.id}`, {
        method: "POST",
      });
      const payload = (await response.json().catch(() => ({}))) as {
        error?: string;
      };
      if (!response.ok)
        throw new Error(payload.error || "Processing could not be restarted.");
      setDocument((current) => ({
        ...current,
        status: "UPLOADED",
        errorMessage: null,
      }));
      toast.success("Processing restarted");
    } catch (error) {
      toast.error("Processing not restarted", {
        description:
          error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setIsRetrying(false);
    }
  };

  const deleteDocument = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/documents/${document.id}`, {
        method: "DELETE",
      });
      const payload = (await response.json().catch(() => ({}))) as {
        error?: string;
      };
      if (!response.ok)
        throw new Error(payload.error || "The document could not be deleted.");
      toast.success("Document deleted");
      router.push("/workspace/documents");
      router.refresh();
    } catch (error) {
      toast.error("Document not deleted", {
        description:
          error instanceof Error ? error.message : "Please try again.",
      });
      setIsDeleting(false);
    }
  };

  const exportHref = (format: "pdf" | "csv") =>
    currentSummary
      ? `/api/documents/${document.id}/summary/export?format=${format}&summaryId=${currentSummary.id}`
      : "#";

  return (
    <main className="nexus-page min-h-dvh bg-[#050505] text-white">
      <div className="nexus-workspace-grid pointer-events-none fixed inset-0 opacity-30" />
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-white/8 bg-[#08080A]/95 px-4 py-5 backdrop-blur-xl lg:flex">
        <DetailNav />
      </aside>
      {mobileNavOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/70"
            aria-label="Close navigation"
            onClick={() => setMobileNavOpen(false)}
          />
          <aside className="relative flex h-full w-[min(20rem,88vw)] flex-col border-r border-white/10 bg-[#08080A] px-4 py-5">
            <button
              type="button"
              onClick={() => setMobileNavOpen(false)}
              className="absolute right-4 top-5 rounded-lg p-2 text-[#A1A1AA]"
              aria-label="Close navigation"
            >
              <X className="h-5 w-5" />
            </button>
            <DetailNav />
          </aside>
        </div>
      ) : null}

      <div className="relative lg:pl-64">
        <header className="sticky top-0 z-20 flex h-17 items-center justify-between border-b border-white/8 bg-[#050505]/88 px-4 backdrop-blur-xl sm:px-7 lg:px-10">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileNavOpen(true)}
              className="rounded-lg p-2 text-[#A1A1AA] hover:bg-white/5 lg:hidden"
              aria-label="Open navigation"
            >
              <SidebarSimple className="h-5 w-5" />
            </button>
            <Link
              href="/workspace/documents"
              className="flex items-center gap-2 text-sm text-[#A1A1AA] transition-colors hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Documents
            </Link>
          </div>
          <UserButton
            appearance={{
              elements: {
                userButtonBox: "h-9 w-9 rounded-lg",
                avatarBox: "h-9 w-9 rounded-lg",
              },
            }}
          />
        </header>

        <div className="mx-auto w-full max-w-[1480px] px-4 pb-16 pt-8 sm:px-7 lg:px-10 lg:pb-20">
          <section className="flex flex-col gap-6 border-b border-white/8 pb-8 xl:flex-row xl:items-end xl:justify-between">
            <div className="min-w-0 max-w-3xl">
              <div className="flex items-center gap-3">
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#5EEAD4]">
                  Document record
                </span>
                <Status status={document.status} />
              </div>
              <h1 className="mt-4 break-words text-[clamp(2rem,4vw,3.8rem)] font-medium leading-[1.02] tracking-[-0.045em] text-white">
                {document.originalName}
              </h1>
              <p className="mt-4 text-sm text-[#71717A]">
                {formatBytes(document.sizeBytes)}
                <span className="mx-2 text-[#3F3F46]">/</span>Uploaded{" "}
                {formatDate(document.createdAt)}
                {document.pageCount ? (
                  <>
                    <span className="mx-2 text-[#3F3F46]">/</span>
                    {document.pageCount} pages
                  </>
                ) : null}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <a
                href={`/api/documents/${document.id}/file`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-10 items-center gap-2 rounded-lg border border-white/10 px-4 text-sm font-medium text-[#D4D4D8] hover:border-[#2DD4BF]/30 hover:bg-[#2DD4BF]/8 hover:text-white"
              >
                <ArrowSquareOut className="h-4 w-4" />
                View original
              </a>
              <a
                href={`/api/documents/${document.id}/file?download=1`}
                className="inline-flex h-10 items-center gap-2 rounded-lg border border-white/10 px-4 text-sm font-medium text-[#D4D4D8] hover:border-[#2DD4BF]/30 hover:bg-[#2DD4BF]/8 hover:text-white"
              >
                <DownloadSimple className="h-4 w-4" />
                Download
              </a>
              <button
                type="button"
                onClick={() => setDeleteOpen(true)}
                className="inline-flex h-10 items-center gap-2 rounded-lg border border-red-400/15 px-4 text-sm font-medium text-red-300 hover:bg-red-400/8"
              >
                <Trash className="h-4 w-4" />
                Delete
              </button>
            </div>
          </section>

          {document.status === "FAILED" ? (
            <section className="mt-6 flex flex-col gap-4 rounded-xl border border-red-400/15 bg-red-400/[0.04] p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-red-200">
                  Processing failed
                </p>
                <p className="mt-1 text-sm text-[#A1A1AA]">
                  {document.errorMessage ||
                    "The document could not be processed."}
                </p>
              </div>
              <button
                type="button"
                disabled={isRetrying}
                onClick={retry}
                className="inline-flex h-10 w-fit items-center gap-2 rounded-lg bg-white px-4 text-sm font-semibold text-[#09090B] disabled:opacity-60"
              >
                {isRetrying ? (
                  <SpinnerGap className="h-4 w-4 animate-spin" />
                ) : (
                  <ArrowClockwise className="h-4 w-4" />
                )}
                Retry processing
              </button>
            </section>
          ) : null}

          <Tabs defaultValue="preview" className="mt-7 gap-5">
            <div className="flex items-center justify-between border-b border-white/8">
              <TabsList variant="line" className="h-11 gap-5 p-0">
                <TabsTrigger
                  value="preview"
                  className="h-11 gap-2 rounded-none px-1 text-[#71717A] data-active:text-white group-data-[variant=line]/tabs-list:data-active:after:bg-[#2DD4BF]"
                >
                  <FilePdf className="h-4 w-4" />
                  Preview
                </TabsTrigger>
                <TabsTrigger
                  value="summary"
                  className="h-11 gap-2 rounded-none px-1 text-[#71717A] data-active:text-white group-data-[variant=line]/tabs-list:data-active:after:bg-[#2DD4BF]"
                >
                  <Sparkle className="h-4 w-4" />
                  Summary
                  {document.summaries.length > 0 ? (
                    <span className="ml-1 rounded bg-[#2DD4BF]/10 px-1.5 py-0.5 font-mono text-[9px] text-[#5EEAD4]">
                      {document.summaries.length}
                    </span>
                  ) : null}
                </TabsTrigger>
              </TabsList>
              <p className="hidden text-xs text-[#52525B] sm:block">
                Switch views without leaving this record
              </p>
            </div>

            <TabsContent value="preview">
              <section
                aria-labelledby="preview-heading"
                className="overflow-hidden rounded-xl border border-white/10 bg-[#0B0B0D]"
              >
                <div className="flex items-center justify-between border-b border-white/8 px-5 py-4 sm:px-6">
                  <div>
                    <h2
                      id="preview-heading"
                      className="text-sm font-semibold text-white"
                    >
                      Document preview
                    </h2>
                    <p className="mt-1 text-xs text-[#71717A]">
                      Original file, securely loaded from your workspace.
                    </p>
                  </div>
                  <FilePdf
                    className="h-5 w-5 text-[#5EEAD4]"
                    weight="duotone"
                  />
                </div>
                <iframe
                  src={`/api/documents/${document.id}/file`}
                  title={`Preview of ${document.originalName}`}
                  className="h-[72dvh] min-h-[34rem] w-full bg-[#17171A]"
                />
              </section>
            </TabsContent>

            <TabsContent value="summary">
              <div className="grid items-start gap-5 xl:grid-cols-[22rem_minmax(0,1fr)]">
                <section className="rounded-xl border border-[#2DD4BF]/20 bg-[#09100F] p-5 sm:p-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#2DD4BF]/10 text-[#5EEAD4]">
                    <Sparkle className="h-5 w-5" weight="fill" />
                  </div>
                  <h2 className="mt-5 text-xl font-semibold tracking-[-0.03em]">
                    Summarize this document
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-[#8B8B95]">
                    Create a concise review of the source text and keep each
                    version in this record.
                  </p>
                  <label className="mt-5 block">
                    <span className="text-xs font-medium text-[#D4D4D8]">
                      Model
                    </span>
                    <span className="relative mt-2 block">
                      <select
                        value={selectedModel}
                        onChange={(event) =>
                          setSelectedModel(event.target.value)
                        }
                        className="h-11 w-full appearance-none rounded-lg border border-white/10 bg-[#0B0B0D] px-3 pr-10 text-sm text-white outline-none focus:border-[#2DD4BF]/50"
                      >
                        {models.map((model) => (
                          <option key={model.id} value={model.id}>
                            {model.label}
                          </option>
                        ))}
                      </select>
                      <CaretDown className="pointer-events-none absolute right-3 top-3.5 h-4 w-4 text-[#71717A]" />
                    </span>
                    <span className="mt-2 block text-xs leading-5 text-[#71717A]">
                      {
                        models.find((model) => model.id === selectedModel)
                          ?.description
                      }
                    </span>
                  </label>
                  <button
                    type="button"
                    onClick={summarize}
                    disabled={document.status !== "READY" || isSummarizing}
                    className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#2DD4BF] text-sm font-semibold text-[#04100E] transition-colors hover:bg-[#5EEAD4] disabled:cursor-not-allowed disabled:bg-[#1F4F48] disabled:text-[#83A8A2]"
                  >
                    {isSummarizing ? (
                      <SpinnerGap className="h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkle className="h-4 w-4" weight="fill" />
                    )}
                    {isSummarizing
                      ? "Summarizing…"
                      : document.status === "READY"
                        ? "Generate summary"
                        : "Available after processing"}
                  </button>
                </section>

                <section className="min-h-[34rem] overflow-hidden rounded-xl border border-white/10 bg-[#0B0B0D]">
                  <div className="flex flex-col gap-4 border-b border-white/8 p-5 sm:flex-row sm:items-center sm:justify-between sm:px-7 sm:py-6">
                    <div>
                      <h2 className="text-lg font-semibold tracking-[-0.02em]">
                        Summary
                      </h2>
                      <p className="mt-1 text-xs text-[#71717A]">
                        {document.summaries.length
                          ? `${document.summaries.length} saved ${document.summaries.length === 1 ? "version" : "versions"}`
                          : "No summary generated yet"}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {document.summaries.length > 1 ? (
                        <select
                          aria-label="Summary version"
                          value={currentSummary?.id}
                          onChange={(event) =>
                            setSelectedSummaryId(event.target.value)
                          }
                          className="h-9 max-w-48 rounded-md border border-white/10 bg-[#111113] px-2 text-xs text-[#D4D4D8] outline-none"
                        >
                          {document.summaries.map((summary, index) => (
                            <option value={summary.id} key={summary.id}>
                              Version {document.summaries.length - index} ·{" "}
                              {summary.model}
                            </option>
                          ))}
                        </select>
                      ) : null}
                      {currentSummary ? (
                        <>
                          <a
                            href={exportHref("pdf")}
                            className="inline-flex h-9 items-center gap-1.5 rounded-md border border-white/10 px-3 text-xs font-medium text-[#D4D4D8] hover:bg-white/5"
                          >
                            <FilePdf className="h-3.5 w-3.5" />
                            PDF
                          </a>
                          <a
                            href={exportHref("csv")}
                            className="inline-flex h-9 items-center gap-1.5 rounded-md border border-white/10 px-3 text-xs font-medium text-[#D4D4D8] hover:bg-white/5"
                          >
                            <FileCsv className="h-3.5 w-3.5" />
                            CSV
                          </a>
                        </>
                      ) : null}
                    </div>
                  </div>
                  <div className="max-h-[66dvh] overflow-y-auto p-5 sm:p-7 lg:px-9">
                    {currentSummary ? (
                      <div className="mx-auto max-w-3xl">
                        <SummaryContent value={currentSummary.summary} />
                        <div className="mt-9 border-t border-white/8 pt-4 font-mono text-[9px] uppercase tracking-[0.1em] text-[#52525B]">
                          Generated {formatDate(currentSummary.createdAt)} ·{" "}
                          {currentSummary.model}
                        </div>
                      </div>
                    ) : (
                      <div className="flex min-h-80 flex-col items-center justify-center text-center">
                        <FileText className="h-8 w-8 text-[#3F3F46]" />
                        <p className="mt-4 text-sm font-medium text-[#A1A1AA]">
                          Your generated summary will appear here.
                        </p>
                        <p className="mt-2 max-w-sm text-xs leading-5 text-[#52525B]">
                          Choose a model and generate a summary from the
                          controls on the left.
                        </p>
                      </div>
                    )}
                  </div>
                </section>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Dialog
        open={deleteOpen}
        onOpenChange={(open) => {
          if (!isDeleting) setDeleteOpen(open);
        }}
      >
        <DialogContent
          showCloseButton={!isDeleting}
          className="border border-red-400/15 bg-[#0B0B0D] p-4 text-white sm:max-w-md"
        >
          <div className="p-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-400/8 text-red-300">
              <WarningCircle className="h-5 w-5" weight="fill" />
            </div>
            <DialogHeader className="mt-5 text-left">
              <DialogTitle>Delete this document?</DialogTitle>
              <DialogDescription className="mt-1 leading-6 text-[#A1A1AA]">
                The original file, extracted text, and every generated summary
                will be permanently removed.
              </DialogDescription>
            </DialogHeader>
          </div>
          <DialogFooter className="border-t border-white/8 bg-[#08080A] px-6 py-4">
            <button
              type="button"
              disabled={isDeleting}
              onClick={() => setDeleteOpen(false)}
              className="h-10 rounded-lg border border-white/10 px-4 text-sm text-[#D4D4D8]"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isDeleting}
              onClick={deleteDocument}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-red-500 px-4 text-sm font-semibold text-white disabled:opacity-60"
            >
              {isDeleting ? (
                <SpinnerGap className="h-4 w-4 animate-spin" />
              ) : (
                <Trash className="h-4 w-4" />
              )}
              {isDeleting ? "Deleting…" : "Delete permanently"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}

function Status({ status }: { status: string }) {
  const ready = status === "READY";
  const failed = status === "FAILED";
  return (
    <span
      className={`rounded-md border px-2 py-1 font-mono text-[9px] uppercase tracking-[0.1em] ${ready ? "border-[#2DD4BF]/25 bg-[#2DD4BF]/8 text-[#5EEAD4]" : failed ? "border-red-400/20 bg-red-400/8 text-red-300" : "border-white/10 bg-white/5 text-[#A1A1AA]"}`}
    >
      {status.replaceAll("_", " ").toLowerCase()}
    </span>
  );
}

function DetailNav() {
  return (
    <>
      <Link href="/" className="flex w-fit items-center gap-2.5 px-2">
        <span className="h-2.5 w-2.5 rounded-full bg-[#2DD4BF] shadow-[0_0_18px_rgba(45,212,191,0.65)]" />
        <span className="text-sm font-semibold tracking-[0.17em]">
          NEXUS<span className="text-[#71717A]">/OPS</span>
        </span>
      </Link>
      <nav className="mt-10 space-y-1" aria-label="Workspace navigation">
        <Link
          href="/workspace"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[#8B8B95] hover:bg-white/5 hover:text-white"
        >
          <House className="h-4 w-4" />
          Overview
        </Link>
        <Link
          href="/workspace/documents"
          aria-current="page"
          className="flex items-center gap-3 rounded-lg bg-[#2DD4BF]/10 px-3 py-2.5 text-sm text-[#5EEAD4]"
        >
          <FileText className="h-4 w-4" weight="fill" />
          Documents
        </Link>
        <Link
          href="/workspace/ask"
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[#8B8B95] hover:bg-white/5 hover:text-white"
        >
          <ChatCenteredDots className="h-4 w-4" />
          Ask Nexus
        </Link>
      </nav>
      <div className="mt-auto rounded-xl border border-white/8 bg-[#0D0D0F] p-4">
        <Sparkle className="h-4 w-4 text-[#5EEAD4]" />
        <p className="mt-3 text-xs leading-5 text-[#71717A]">
          Generate and export a focused summary from this document.
        </p>
      </div>
    </>
  );
}
