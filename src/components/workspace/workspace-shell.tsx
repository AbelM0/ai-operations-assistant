"use client";

import { UserButton } from "@clerk/nextjs";
import {
  ArrowRight,
  ChatCenteredDots,
  CheckCircle,
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
}: {
  firstName: string;
  initialDocuments: WorkspaceDocument[];
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
  return (
    <>
      <section className="max-w-3xl">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-[#5EEAD4]">
          First workspace setup
        </p>
        <h1 className="mt-4 text-balance text-[clamp(2.35rem,5vw,4.75rem)] font-medium leading-[0.98] tracking-[-0.05em] text-white">
          Welcome, {firstName}. Bring your operations into focus.
        </h1>
        <p className="mt-5 max-w-2xl text-pretty text-base leading-7 text-[#A1A1AA] sm:text-lg">
          Add a source document to build a searchable record your team can question, review, and act on.
        </p>
      </section>

      <div className="mt-10 grid items-start gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(19rem,0.7fr)]">
        <DocumentUpload onUploaded={onUploaded} />
        <aside className="rounded-xl border border-white/10 bg-[#0B0B0D] p-5 sm:p-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 text-[#5EEAD4]">
            <Lightning className="h-5 w-5" weight="duotone" />
          </div>
          <h2 className="mt-5 text-lg font-semibold tracking-[-0.025em] text-white">What happens after upload</h2>
          <ol className="mt-5 space-y-5">
            {[
              ["Nexus reads the file", "Text and document structure are prepared for search."],
              ["Key details are organized", "Important values, dates, and parties become easy to review."],
              ["Your workspace becomes searchable", "Ask questions and trace each answer to its source."],
            ].map(([title, body], index) => (
              <li key={title} className="grid grid-cols-[1.75rem_1fr] gap-3">
                <span className="font-mono text-[10px] leading-6 text-[#5EEAD4]">0{index + 1}</span>
                <div>
                  <p className="text-sm font-medium text-[#E4E4E7]">{title}</p>
                  <p className="mt-1 text-xs leading-5 text-[#71717A]">{body}</p>
                </div>
              </li>
            ))}
          </ol>
        </aside>
      </div>

      <section aria-labelledby="guidance-heading" className="mt-6 rounded-xl border border-white/10 bg-[#0B0B0D] p-5 sm:p-7">
        <h2 id="guidance-heading" className="text-lg font-semibold tracking-[-0.025em] text-white">A useful place to start</h2>
        <p className="mt-1 text-sm leading-6 text-[#8B8B95]">Choose a document that answers a real operational question.</p>
        <div className="mt-6 grid gap-px overflow-hidden rounded-lg border border-white/8 bg-white/8 md:grid-cols-3">
          {guidance.map(({ title, body, icon: Icon }) => (
            <article key={title} className="bg-[#0E0E11] p-5 transition-colors hover:bg-[#121216]">
              <Icon className="h-5 w-5 text-[#5EEAD4]" weight="duotone" />
              <h3 className="mt-5 text-sm font-semibold text-white">{title}</h3>
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
  showFirstUploadNextSteps,
  onUpload,
}: {
  firstName: string;
  documents: WorkspaceDocument[];
  showFirstUploadNextSteps: boolean;
  onUpload: () => void;
}) {
  return (
    <>
      <section className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-[#5EEAD4]">
            {showFirstUploadNextSteps ? "First document received" : "Workspace overview"}
          </p>
          <h1 className="mt-4 text-balance text-[clamp(2.35rem,5vw,4.5rem)] font-medium leading-[0.98] tracking-[-0.05em] text-white">
            {showFirstUploadNextSteps ? "Your workspace is taking shape." : `Good to see you, ${firstName}.`}
          </h1>
          <p className="mt-5 max-w-2xl text-pretty text-base leading-7 text-[#A1A1AA] sm:text-lg">
            {showFirstUploadNextSteps
              ? "NexusOps has stored your first source. Follow its status, then review and ask questions."
              : "Review your document library or add another source for NexusOps to process."}
          </p>
        </div>
        <button
          type="button"
          onClick={onUpload}
          className="inline-flex h-11 w-fit shrink-0 items-center justify-center gap-2 rounded-lg bg-[#2DD4BF] px-5 text-sm font-semibold text-[#04100E] transition-colors hover:bg-[#5EEAD4] active:translate-y-px"
        >
          <Plus className="h-4 w-4" weight="bold" />
          Upload document
        </button>
      </section>

      {showFirstUploadNextSteps ? <NextSteps /> : <WorkspaceSummary documents={documents} />}
      <DocumentList documents={documents} />
    </>
  );
}

function NextSteps() {
  const steps = [
    {
      title: "Processing starts now",
      body: "NexusOps prepares the file for extraction and search.",
      icon: Lightning,
    },
    {
      title: "Review document details",
      body: "Confirm important values, dates, and business entities.",
      icon: CheckCircle,
    },
    {
      title: "Ask your first question",
      body: "Use the source to get a traceable operational answer.",
      icon: Sparkle,
    },
  ];

  return (
    <section aria-labelledby="next-steps-heading" className="mt-10 rounded-xl border border-[#2DD4BF]/20 bg-[#0B1110] p-5 sm:p-7">
      <h2 id="next-steps-heading" className="text-lg font-semibold tracking-[-0.025em] text-white">Continue the workflow</h2>
      <div className="mt-6 grid gap-px overflow-hidden rounded-lg border border-white/8 bg-white/8 md:grid-cols-3">
        {steps.map(({ title, body, icon: Icon }, index) => (
          <article key={title} className="bg-[#0D1312] p-5">
            <div className="flex items-center justify-between">
              <Icon className="h-5 w-5 text-[#5EEAD4]" weight="duotone" />
              <span className="font-mono text-[9px] text-[#52706B]">0{index + 1}</span>
            </div>
            <h3 className="mt-6 text-sm font-semibold text-white">{title}</h3>
            <p className="mt-2 text-xs leading-5 text-[#8B8B95]">{body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function WorkspaceSummary({ documents }: { documents: WorkspaceDocument[] }) {
  const readyCount = documents.filter((document) => document.status === "READY").length;
  const totalBytes = documents.reduce((total, document) => total + document.sizeBytes, 0);

  return (
    <section aria-label="Workspace summary" className="mt-10 grid gap-px overflow-hidden rounded-xl border border-white/10 bg-white/8 sm:grid-cols-3">
      {[
        ["Documents", documents.length.toString()],
        ["Ready to search", readyCount.toString()],
        ["Stored securely", formatBytes(totalBytes)],
      ].map(([label, value]) => (
        <div key={label} className="bg-[#0B0B0D] p-5 sm:p-6">
          <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#71717A]">{label}</p>
          <p className="mt-3 text-2xl font-medium tracking-[-0.04em] text-white">{value}</p>
        </div>
      ))}
    </section>
  );
}

function DocumentList({ documents }: { documents: WorkspaceDocument[] }) {
  return (
    <section aria-labelledby="documents-heading" className="mt-6 overflow-hidden rounded-xl border border-white/10 bg-[#0B0B0D]">
      <div className="flex items-center justify-between gap-4 border-b border-white/8 px-5 py-5 sm:px-7">
        <div>
          <h2 id="documents-heading" className="text-lg font-semibold tracking-[-0.025em] text-white">Recent documents</h2>
          <p className="mt-1 text-sm text-[#71717A]">The latest sources added to your workspace.</p>
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
          <article key={document.id} className="grid gap-4 px-5 py-4 transition-colors hover:bg-white/[0.025] sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:px-7">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#2DD4BF]/8 text-[#5EEAD4]">
                {document.mimeType === "application/pdf" ? (
                  <FilePdf className="h-5 w-5" weight="duotone" />
                ) : (
                  <FileText className="h-5 w-5" weight="duotone" />
                )}
              </div>
              <div className="min-w-0">
                <h3 className="truncate text-sm font-medium text-[#E4E4E7]">{document.originalName}</h3>
                <p className="mt-1 text-xs text-[#71717A]">{formatBytes(document.sizeBytes)} • {formatDate(document.createdAt)}</p>
              </div>
            </div>
            <StatusLabel status={document.status} />
          </article>
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
