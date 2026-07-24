"use client";

import { UserButton } from "@clerk/nextjs";
import {
  ArrowRight,
  ArrowUpRight,
  ChatCenteredDots,
  CheckCircle,
  Clock,
  FilePdf,
  FileText,
  FolderSimple,
  House,
  Lightning,
  MagnifyingGlass,
  Plus,
  Receipt,
  SidebarSimple,
  Sparkle,
  X,
} from "@phosphor-icons/react";
import Link from "next/link";
import { useState } from "react";
import { DocumentUpload } from "./document-upload";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { WorkspaceDocument } from "@/lib/documents/types";
import type { ConversationSummary } from "@/lib/rag/types";

const guidance = [
  {
    title: "Invoices",
    body: "Track vendors, totals, due dates, and tax details.",
    icon: FileText,
  },
  {
    title: "Receipts",
    body: "Capture expenses and keep source records together.",
    icon: Receipt,
  },
  {
    title: "Business documents",
    body: "Search contracts, reports, statements, and policies.",
    icon: FolderSimple,
  },
];

const navItems = [
  { label: "Overview", icon: House, href: "/workspace", active: true },
  { label: "Documents", icon: FileText, href: "/workspace/documents", active: false },
  { label: "Ask Nexus", icon: ChatCenteredDots, href: "/workspace/ask", active: false },
];

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(value));
}

export function WorkspaceShell({
  firstName,
  initialDocuments,
  initialConversations,
  conversationCount,
}: {
  firstName: string;
  initialDocuments: WorkspaceDocument[];
  initialConversations: ConversationSummary[];
  conversationCount: number;
}) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [documents, setDocuments] = useState(initialDocuments);
  const [showFirstUploadNextSteps, setShowFirstUploadNextSteps] = useState(false);
  const isNewUser = documents.length === 0;

  const handleUploaded = (document: WorkspaceDocument) => {
    const wasFirstUpload = documents.length === 0;
    setDocuments((current) => [document, ...current]);
    setUploadDialogOpen(false);
    if (wasFirstUpload) setShowFirstUploadNextSteps(true);
  };

  return (
    <main className="nexus-page min-h-dvh bg-[#050505] text-white">
      <div className="nexus-workspace-grid pointer-events-none fixed inset-0 opacity-30" />

      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-white/8 bg-[#08080A]/95 px-4 py-5 backdrop-blur-xl lg:flex">
        <WorkspaceNav documentCount={documents.length} onUpload={() => setUploadDialogOpen(true)} />
      </aside>

      {mobileNavOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/70"
            aria-label="Close navigation"
            onClick={() => setMobileNavOpen(false)}
          />
          <aside className="relative flex h-full w-[min(20rem,88vw)] flex-col border-r border-white/10 bg-[#08080A] px-4 py-5 shadow-2xl shadow-black">
            <button
              type="button"
              onClick={() => setMobileNavOpen(false)}
              className="absolute right-4 top-5 rounded-lg p-2 text-[#A1A1AA] hover:bg-white/5 hover:text-white"
              aria-label="Close navigation"
            >
              <X className="h-5 w-5" />
            </button>
            <WorkspaceNav documentCount={documents.length} onUpload={() => setUploadDialogOpen(true)} />
          </aside>
        </div>
      ) : null}

      <div className="relative lg:pl-64">
        <header className="sticky top-0 z-20 flex h-17 items-center justify-between border-b border-white/8 bg-[#050505]/88 px-4 backdrop-blur-xl sm:px-7 lg:px-10">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileNavOpen(true)}
              className="rounded-lg p-2 text-[#A1A1AA] hover:bg-white/5 hover:text-white focus-visible:outline-2 focus-visible:outline-[#5EEAD4] lg:hidden"
              aria-label="Open navigation"
            >
              <SidebarSimple className="h-5 w-5" />
            </button>
            <div>
              <p className="text-sm font-medium text-white">Workspace</p>
              <p className="hidden text-xs text-[#71717A] sm:block">Your private operations library</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <UserButton
              appearance={{
                elements: {
                  userButtonBox: "h-9 w-9 rounded-lg",
                  avatarBox: "h-9 w-9 rounded-lg",
                  userButtonTrigger: "focus:ring-2 focus:ring-[#5EEAD4] focus:ring-offset-2 focus:ring-offset-[#050505]",
                },
              }}
            />
          </div>
        </header>

        <div className="mx-auto w-full max-w-[1480px] px-4 pb-16 pt-9 sm:px-7 sm:pt-12 lg:px-10 lg:pb-20">
          {isNewUser ? (
            <NewUserOverview firstName={firstName} onUploaded={handleUploaded} />
          ) : (
            <ActiveWorkspaceOverview
              firstName={firstName}
              documents={documents}
              conversations={initialConversations}
              conversationCount={conversationCount}
              showFirstUploadNextSteps={showFirstUploadNextSteps}
              onUpload={() => setUploadDialogOpen(true)}
            />
          )}
        </div>
      </div>

      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto border border-white/10 bg-[#0B0B0D] p-5 text-white shadow-[0_32px_120px_rgba(0,0,0,0.75)] sm:max-w-2xl sm:p-7">
          <DialogHeader className="pr-10">
            <DialogTitle className="text-xl font-semibold tracking-[-0.025em] text-white">Upload a document</DialogTitle>
            <DialogDescription className="leading-6 text-[#8B8B95]">
              Add another invoice, receipt, or business document to your workspace.
            </DialogDescription>
          </DialogHeader>
          <DocumentUpload showHeader={false} onUploaded={handleUploaded} />
        </DialogContent>
      </Dialog>
    </main>
  );
}

function NewUserOverview({
  firstName,
  onUploaded,
}: {
  firstName: string;
  onUploaded: (document: WorkspaceDocument) => void;
}) {
  const workflow = [
    {
      title: "Add a source",
      body: "Upload a PDF or image from your day-to-day operations.",
      icon: Plus,
    },
    {
      title: "Let Nexus index it",
      body: "OCR, page structure, and searchable chunks are prepared automatically.",
      icon: Lightning,
    },
    {
      title: "Review the document",
      body: "Open the preview and generate a streamed summary of the important material.",
      icon: FileText,
    },
    {
      title: "Ask with evidence",
      body: "Select one or more ready documents, ask a question, and verify the cited sources.",
      icon: ChatCenteredDots,
    },
  ];

  return (
    <>
      <section className="grid gap-8 border-b border-white/8 pb-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <div className="max-w-3xl">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-[#5EEAD4]">
            Workspace setup · 0 of 4 complete
          </p>
          <h1 className="mt-4 text-balance text-[clamp(2.5rem,5vw,4.75rem)] font-medium leading-[0.98] tracking-[-0.05em] text-white">
            Start with one document, {firstName}.
          </h1>
          <p className="mt-5 max-w-2xl text-pretty text-base leading-7 text-[#A1A1AA] sm:text-lg">
            NexusOps turns a business file into a searchable source, a clear
            summary, and answers you can trace back to the page.
          </p>
        </div>
        <div className="hidden items-center gap-3 font-mono text-[9px] uppercase tracking-[0.14em] text-[#71717A] sm:flex">
          <span className="h-px w-12 bg-[#2DD4BF]/45" />
          About two minutes to begin
        </div>
      </section>

      <div className="mt-8 grid items-start gap-5 xl:grid-cols-[minmax(20rem,0.72fr)_minmax(0,1.28fr)]">
        <section
          aria-labelledby="workflow-guide-heading"
          className="overflow-hidden rounded-xl border border-[#2DD4BF]/18 bg-[#0B1110]"
        >
          <div className="border-b border-white/8 px-5 py-5 sm:px-6">
            <p className="font-mono text-[9px] uppercase tracking-[0.15em] text-[#5EEAD4]">
              Your first workflow
            </p>
            <h2
              id="workflow-guide-heading"
              className="mt-2 text-xl font-semibold tracking-[-0.03em] text-white"
            >
              From upload to grounded answer
            </h2>
          </div>
          <ol className="px-5 py-2 sm:px-6">
            {workflow.map(({ title, body, icon: Icon }, index) => (
              <li
                key={title}
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
                      {title}
                    </p>
                    <span className="font-mono text-[9px] text-[#52706B]">
                      0{index + 1}
                    </span>
                  </div>
                  <p className="mt-1.5 text-xs leading-5 text-[#7E8C89]">
                    {body}
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
            Choose a useful first source
          </h2>
          <p className="mt-2 max-w-sm text-sm leading-6 text-[#71717A]">
            Pick something connected to a question you already need to answer.
          </p>
        </div>
        <div className="grid gap-px overflow-hidden rounded-lg border border-white/8 bg-white/8 md:grid-cols-3">
          {guidance.map(({ title, body, icon: Icon }) => (
            <article
              key={title}
              className="bg-[#0E0E11] p-4 transition-colors hover:bg-[#121216]"
            >
              <Icon className="h-5 w-5 text-[#5EEAD4]" weight="duotone" />
              <h3 className="mt-4 text-sm font-semibold text-white">{title}</h3>
              <p className="mt-2 text-xs leading-5 text-[#8B8B95]">{body}</p>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}

function ActiveWorkspaceOverview({
  firstName,
  documents,
  conversations,
  conversationCount,
  showFirstUploadNextSteps,
  onUpload,
}: {
  firstName: string;
  documents: WorkspaceDocument[];
  conversations: ConversationSummary[];
  conversationCount: number;
  showFirstUploadNextSteps: boolean;
  onUpload: () => void;
}) {
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
              ? "First source received"
              : "Workspace dashboard"}
          </p>
          <h1 className="mt-3 text-balance text-[clamp(2.25rem,4.5vw,4rem)] font-medium leading-[1] tracking-[-0.05em] text-white">
            {showFirstUploadNextSteps
              ? "Your first workflow is underway."
              : `Good to see you, ${firstName}.`}
          </h1>
          <p className="mt-4 max-w-2xl text-pretty text-sm leading-6 text-[#A1A1AA] sm:text-base">
            {showFirstUploadNextSteps
              ? "Nexus is preparing the document for preview, summaries, and source-grounded questions."
              : processingCount > 0
                ? `${processingCount} ${processingCount === 1 ? "document is" : "documents are"} still being prepared. Ready sources can already be used in Ask Nexus.`
                : "Your ready documents, recent conversations, and next actions are collected here."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/workspace/ask"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-white/10 px-4 text-sm font-semibold text-[#D4D4D8] transition-colors hover:border-[#2DD4BF]/35 hover:bg-[#2DD4BF]/8 hover:text-white active:translate-y-px"
          >
            <ChatCenteredDots className="h-4 w-4" />
            Ask Nexus
          </Link>
          <button
            type="button"
            onClick={onUpload}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#2DD4BF] px-4 text-sm font-semibold text-[#04100E] transition-colors hover:bg-[#5EEAD4] active:translate-y-px"
          >
            <Plus className="h-4 w-4" weight="bold" />
            Upload
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
          <span>
            {failedCount} {failedCount === 1 ? "document needs" : "documents need"}{" "}
            attention before they can be searched.
          </span>
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

function FirstSourceGuide({ document }: { document: WorkspaceDocument }) {
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
              Step {isReady ? "02 complete" : "02 in progress"}
            </p>
            <h2
              id="next-steps-heading"
              className="mt-1 text-base font-semibold tracking-[-0.02em] text-white"
            >
              {isReady
                ? "Your first source is ready"
                : "Nexus is preparing your first source"}
            </h2>
          </div>
        </div>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-[#7E8C89]">
          {isReady
            ? "Open the document to preview it or generate a summary, then select it in Ask Nexus for your first cited answer."
            : `${document.originalName} will become available for preview, summarization, and chat when processing finishes.`}
        </p>
      </div>
      <Link
        href={`/workspace/documents/${document.id}`}
        className="inline-flex h-10 w-fit items-center gap-2 rounded-lg border border-[#2DD4BF]/25 px-4 text-xs font-semibold text-[#D4D4D8] transition-colors hover:bg-[#2DD4BF]/8 hover:text-white"
      >
        View document
        <ArrowUpRight className="h-3.5 w-3.5" weight="bold" />
      </Link>
    </section>
  );
}

function WorkspaceSummary({
  documents,
  conversationCount,
}: {
  documents: WorkspaceDocument[];
  conversationCount: number;
}) {
  const readyCount = documents.filter(
    (document) => document.status === "READY",
  ).length;
  const processingCount = documents.filter(
    (document) =>
      document.status !== "READY" && document.status !== "FAILED",
  ).length;
  const totalBytes = documents.reduce(
    (total, document) => total + document.sizeBytes,
    0,
  );
  const metrics = [
    {
      label: "Total sources",
      value: documents.length.toString(),
      detail: formatBytes(totalBytes),
    },
    {
      label: "Ready to ask",
      value: readyCount.toString(),
      detail: readyCount === 1 ? "searchable document" : "searchable documents",
    },
    {
      label: "Processing",
      value: processingCount.toString(),
      detail: processingCount > 0 ? "preparing now" : "queue is clear",
    },
    {
      label: "Conversations",
      value: conversationCount.toString(),
      detail: "saved in Ask Nexus",
    },
  ];

  return (
    <section
      aria-label="Workspace summary"
      className="mt-6 grid gap-px overflow-hidden rounded-xl border border-white/10 bg-white/8 sm:grid-cols-2 xl:grid-cols-4"
    >
      {metrics.map(({ label, value, detail }) => (
        <div key={label} className="bg-[#0B0B0D] p-5 sm:p-6">
          <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#71717A]">
            {label}
          </p>
          <div className="mt-4 flex items-end justify-between gap-3">
            <p className="text-3xl font-medium tabular-nums tracking-[-0.05em] text-white">
              {value}
            </p>
            <p className="pb-1 text-right text-[10px] leading-4 text-[#5E5E66]">
              {detail}
            </p>
          </div>
        </div>
      ))}
    </section>
  );
}

function ConversationPanel({
  conversations,
}: {
  conversations: ConversationSummary[];
}) {
  return (
    <aside className="overflow-hidden rounded-xl border border-white/10 bg-[#0B0B0D]">
      <div className="border-b border-white/8 px-5 py-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold tracking-[-0.025em] text-white">
              Ask Nexus
            </h2>
            <p className="mt-1 text-xs leading-5 text-[#71717A]">
              Continue a saved conversation or start with new sources.
            </p>
          </div>
          <ChatCenteredDots
            className="h-5 w-5 shrink-0 text-[#5EEAD4]"
            weight="duotone"
          />
        </div>
      </div>
      <div className="p-2">
        {conversations.length > 0 ? (
          <div className="space-y-0.5">
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                className="flex items-start gap-3 rounded-lg px-3 py-3 transition-colors hover:bg-white/[0.035]"
              >
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-[#52525B]" />
                <div className="min-w-0">
                  <p className="truncate text-xs font-medium text-[#D4D4D8]">
                    {conversation.title}
                  </p>
                  <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.1em] text-[#52525B]">
                    {formatDate(
                      conversation.lastMessageAt ?? conversation.createdAt,
                    )}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-3 py-8 text-center">
            <Sparkle className="mx-auto h-5 w-5 text-[#3F3F46]" />
            <p className="mt-3 text-xs leading-5 text-[#71717A]">
              Your source-grounded conversations will appear here.
            </p>
          </div>
        )}
        <Link
          href="/workspace/ask"
          className="mt-2 flex h-10 items-center justify-between rounded-lg bg-[#2DD4BF]/9 px-3.5 text-xs font-semibold text-[#5EEAD4] transition-colors hover:bg-[#2DD4BF]/14"
        >
          {conversations.length > 0
            ? "Open conversation history"
            : "Start your first chat"}
          <ArrowRight className="h-3.5 w-3.5" weight="bold" />
        </Link>
      </div>
    </aside>
  );
}

function DocumentList({ documents }: { documents: WorkspaceDocument[] }) {
  return (
    <section
      aria-labelledby="documents-heading"
      className="overflow-hidden rounded-xl border border-white/10 bg-[#0B0B0D]"
    >
      <div className="flex items-center justify-between gap-4 border-b border-white/8 px-5 py-5 sm:px-6">
        <div>
          <h2
            id="documents-heading"
            className="text-lg font-semibold tracking-[-0.025em] text-white"
          >
            Recent documents
          </h2>
          <p className="mt-1 text-sm text-[#71717A]">
            Open a source to preview, summarize, or check its status.
          </p>
        </div>
        <Link
          href="/workspace/documents"
          className="inline-flex h-9 items-center gap-2 rounded-lg border border-white/10 px-3.5 text-xs font-semibold text-[#D4D4D8] transition-colors hover:border-[#2DD4BF]/35 hover:bg-[#2DD4BF]/8 hover:text-white"
        >
          View all
          <ArrowRight className="h-3.5 w-3.5" weight="bold" />
        </Link>
      </div>
      <div className="divide-y divide-white/7">
        {documents.slice(0, 4).map((document) => (
          <Link
            key={document.id}
            href={`/workspace/documents/${document.id}`}
            className="group grid gap-4 px-5 py-4 transition-colors hover:bg-white/[0.035] sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:px-6"
          >
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#2DD4BF]/8 text-[#5EEAD4]">
                {document.mimeType === "application/pdf" ? (
                  <FilePdf className="h-5 w-5" weight="duotone" />
                ) : (
                  <FileText className="h-5 w-5" weight="duotone" />
                )}
              </div>
              <div className="min-w-0">
                <h3 className="truncate text-sm font-medium text-[#E4E4E7] transition-colors group-hover:text-white">
                  {document.originalName}
                </h3>
                <p className="mt-1 text-xs text-[#71717A]">
                  {formatBytes(document.sizeBytes)} •{" "}
                  {formatDate(document.createdAt)}
                </p>
              </div>
            </div>
            <StatusLabel status={document.status} />
          </Link>
        ))}
      </div>
    </section>
  );
}

function StatusLabel({ status }: { status: string }) {
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
      {normalized}
    </span>
  );
}

function WorkspaceNav({ documentCount, onUpload }: { documentCount: number; onUpload: () => void }) {
  return (
    <>
      <Link href="/" className="flex w-fit items-center gap-2.5 px-2" aria-label="NexusOps home">
        <span className="h-2.5 w-2.5 rounded-full bg-[#2DD4BF] shadow-[0_0_18px_rgba(45,212,191,0.65)]" />
        <span className="text-sm font-semibold tracking-[0.17em] text-white">
          NEXUS<span className="text-[#71717A]">/OPS</span>
        </span>
      </Link>

      <nav aria-label="Workspace navigation" className="mt-10 space-y-1">
        {navItems.map(({ label, icon: Icon, href, active }) =>
          href ? (
            <Link
              key={label}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${active ? "bg-[#2DD4BF]/10 text-[#5EEAD4]" : "text-[#8B8B95] hover:bg-white/5 hover:text-white"}`}
            >
              <Icon className="h-4 w-4" weight={active ? "fill" : "regular"} />
              {label}
            </Link>
          ) : (
            <button key={label} type="button" disabled className="flex w-full cursor-not-allowed items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-[#52525B]">
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ),
        )}
      </nav>

      <div className="mt-auto rounded-xl border border-white/8 bg-[#0D0D0F] p-4">
        {documentCount > 0 ? (
          <>
            <MagnifyingGlass className="h-4 w-4 text-[#5EEAD4]" />
            <p className="mt-3 text-xs leading-5 text-[#71717A]">Your library contains {documentCount} {documentCount === 1 ? "document" : "documents"}.</p>
          </>
        ) : (
          <p className="text-xs leading-5 text-[#71717A]">Add your first source to activate document search.</p>
        )}
        <button type="button" onClick={onUpload} className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-[#D4D4D8] hover:text-white">
          Upload document
          <ArrowRight className="h-3.5 w-3.5" weight="bold" />
        </button>
      </div>
    </>
  );
}
