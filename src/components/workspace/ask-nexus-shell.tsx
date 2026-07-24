"use client";

import { UserButton } from "@clerk/nextjs";
import {
  ArrowUp,
  ChatCenteredDots,
  Check,
  FilePdf,
  FileText,
  House,
  MagnifyingGlass,
  Plus,
  SidebarSimple,
  Sparkle,
  X,
} from "@phosphor-icons/react";
import Link from "next/link";
import { useState } from "react";
import type { FormEvent } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { WorkspaceDocument } from "@/lib/documents/types";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

const prompts = [
  "What are the most important facts in these documents?",
  "Which dates and deadlines should I know about?",
  "Find any amounts, fees, or payment terms.",
  "Where do these documents disagree?",
];

export function AskNexusShell({ documents }: { documents: WorkspaceDocument[] }) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [chatStarted, setChatStarted] = useState(false);
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [isResponding, setIsResponding] = useState(false);

  const toggleDocument = (id: string) => {
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  };

  const sendMessage = (value = draft) => {
    const question = value.trim();
    if (!question || selectedIds.length === 0 || isResponding) return;

    setMessages((current) => [
      ...current,
      { id: crypto.randomUUID(), role: "user", content: question },
    ]);
    setDraft("");
    setIsResponding(true);

    window.setTimeout(() => {
      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content:
            "This is the response layout for document-grounded answers. The retrieval service will replace this preview with an answer and exact source references.",
        },
      ]);
      setIsResponding(false);
    }, 850);
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    sendMessage();
  };

  return (
    <main className="nexus-page min-h-dvh bg-[#050505] text-white">
      <div className="nexus-workspace-grid pointer-events-none fixed inset-0 opacity-30" />

      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-white/8 bg-[#08080A]/95 px-4 py-5 backdrop-blur-xl lg:flex">
        <AskNav documentCount={documents.length} />
      </aside>

      {mobileNavOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button type="button" className="absolute inset-0 bg-black/70" aria-label="Close navigation" onClick={() => setMobileNavOpen(false)} />
          <aside className="relative flex h-full w-[min(20rem,88vw)] flex-col border-r border-white/10 bg-[#08080A] px-4 py-5">
            <button type="button" onClick={() => setMobileNavOpen(false)} className="absolute right-4 top-5 rounded-lg p-2 text-[#A1A1AA] hover:bg-white/5 hover:text-white" aria-label="Close navigation">
              <X className="h-5 w-5" />
            </button>
            <AskNav documentCount={documents.length} />
          </aside>
        </div>
      ) : null}

      <div className="relative flex min-h-dvh flex-col lg:pl-64">
        <header className="sticky top-0 z-20 flex h-17 items-center justify-between border-b border-white/8 bg-[#050505]/88 px-4 backdrop-blur-xl sm:px-7 lg:px-10">
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => setMobileNavOpen(true)} className="rounded-lg p-2 text-[#A1A1AA] hover:bg-white/5 hover:text-white focus-visible:outline-2 focus-visible:outline-[#5EEAD4] lg:hidden" aria-label="Open navigation">
              <SidebarSimple className="h-5 w-5" />
            </button>
            <div>
              <p className="text-sm font-medium text-white">Ask Nexus</p>
              <p className="hidden text-xs text-[#71717A] sm:block">Answers grounded in the sources you choose</p>
            </div>
          </div>
          <UserButton appearance={{ elements: { userButtonBox: "h-9 w-9 rounded-lg", avatarBox: "h-9 w-9 rounded-lg" } }} />
        </header>

        {!chatStarted ? (
          <DocumentSetup
            documents={documents}
            selectedIds={selectedIds}
            onToggle={toggleDocument}
            onStart={() => setChatStarted(true)}
          />
        ) : (
          <section className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 sm:px-7 lg:px-10">
            <div className="flex items-center justify-between gap-4 border-b border-white/8 py-4">
              <button type="button" onClick={() => setSelectorOpen(true)} className="group flex min-w-0 items-center gap-3 rounded-lg p-1 text-left focus-visible:outline-2 focus-visible:outline-[#5EEAD4]">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#2DD4BF]/10 text-[#5EEAD4]">
                  <FileText className="h-4 w-4" weight="fill" />
                </span>
                <span className="min-w-0">
                  <span className="block text-xs font-medium text-[#E4E4E7]">{selectedIds.length} {selectedIds.length === 1 ? "source" : "sources"} selected</span>
                  <span className="block truncate text-[11px] text-[#71717A] group-hover:text-[#A1A1AA]">Change document context</span>
                </span>
              </button>
              <button type="button" onClick={() => { setMessages([]); setDraft(""); }} className="inline-flex h-9 items-center gap-2 rounded-lg border border-white/10 px-3 text-xs font-medium text-[#D4D4D8] transition-colors hover:border-[#2DD4BF]/30 hover:bg-[#2DD4BF]/8 hover:text-white active:translate-y-px">
                <Plus className="h-3.5 w-3.5" weight="bold" />
                New chat
              </button>
            </div>

            <div className="flex flex-1 flex-col">
              {messages.length === 0 ? (
                <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center py-12 sm:py-16">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#2DD4BF]/20 bg-[#09100F] text-[#5EEAD4]">
                    <Sparkle className="h-5 w-5" weight="fill" />
                  </div>
                  <h1 className="mt-6 text-3xl font-medium tracking-[-0.04em] text-white sm:text-4xl">What do you need to know?</h1>
                  <p className="mt-3 max-w-xl text-sm leading-6 text-[#8B8B95]">Ask across the selected documents. You can change the source set at any point in the conversation.</p>
                  <div className="mt-8 grid gap-2 sm:grid-cols-2">
                    {prompts.map((prompt) => (
                      <button key={prompt} type="button" onClick={() => sendMessage(prompt)} className="min-h-16 rounded-lg border border-white/10 bg-[#0B0B0D] px-4 py-3 text-left text-sm leading-5 text-[#D4D4D8] transition-colors hover:border-[#2DD4BF]/30 hover:bg-[#0D1312] hover:text-white active:translate-y-px">
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="mx-auto w-full max-w-3xl flex-1 py-8 sm:py-10">
                  <div className="space-y-8" aria-live="polite">
                    {messages.map((message) => (
                      <article key={message.id} className={message.role === "user" ? "ml-auto max-w-[88%]" : "max-w-[92%]"}>
                        {message.role === "assistant" ? (
                          <div className="grid grid-cols-[2rem_1fr] gap-3">
                            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#2DD4BF]/10 text-[#5EEAD4]">
                              <Sparkle className="h-3.5 w-3.5" weight="fill" />
                            </span>
                            <div>
                              <p className="text-sm leading-7 text-[#D4D4D8] sm:text-[15px]">{message.content}</p>
                              <div className="mt-4 rounded-lg border border-white/8 bg-[#0B0B0D] p-3">
                                <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#5EEAD4]">Source references</p>
                                <p className="mt-1.5 text-xs leading-5 text-[#71717A]">Exact passages and page links will appear here when retrieval is connected.</p>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <p className="rounded-xl bg-[#18181B] px-4 py-3 text-sm leading-6 text-[#F4F4F5]">{message.content}</p>
                        )}
                      </article>
                    ))}
                    {isResponding ? (
                      <div className="grid grid-cols-[2rem_1fr] gap-3">
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#2DD4BF]/10 text-[#5EEAD4]"><Sparkle className="h-3.5 w-3.5" weight="fill" /></span>
                        <div className="space-y-2 pt-1" aria-label="Nexus is preparing a response">
                          <div className="h-2.5 w-4/5 animate-pulse rounded bg-white/8" />
                          <div className="h-2.5 w-3/5 animate-pulse rounded bg-white/6" />
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              )}

              <div className="sticky bottom-0 bg-[linear-gradient(to_top,#050505_82%,transparent)] pb-5 pt-8">
                <form onSubmit={submit} className="mx-auto max-w-3xl">
                  {selectedIds.length === 0 ? (
                    <button type="button" onClick={() => setSelectorOpen(true)} className="mb-2 text-xs font-medium text-amber-300 hover:text-amber-200">Select at least one document to continue</button>
                  ) : null}
                  <div className="rounded-xl border border-white/12 bg-[#111113] p-2 shadow-[0_18px_60px_rgba(0,0,0,0.35)] focus-within:border-[#2DD4BF]/45">
                    <label htmlFor="nexus-question" className="sr-only">Ask a question about selected documents</label>
                    <textarea id="nexus-question" value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); sendMessage(); } }} rows={2} placeholder="Ask a question about your documents" className="max-h-40 min-h-14 w-full resize-none bg-transparent px-3 py-2 text-sm leading-6 text-white outline-none placeholder:text-[#5E5E66]" />
                    <div className="flex items-center justify-between gap-3 px-1 pb-1">
                      <button type="button" onClick={() => setSelectorOpen(true)} className="inline-flex h-8 items-center gap-2 rounded-md px-2 text-xs text-[#8B8B95] hover:bg-white/5 hover:text-white">
                        <FileText className="h-3.5 w-3.5" />
                        {selectedIds.length} selected
                      </button>
                      <button type="submit" disabled={!draft.trim() || selectedIds.length === 0 || isResponding} className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#2DD4BF] text-[#04100E] transition-colors hover:bg-[#5EEAD4] active:translate-y-px disabled:cursor-not-allowed disabled:bg-[#263B38] disabled:text-[#718984]" aria-label="Send question">
                        <ArrowUp className="h-4 w-4" weight="bold" />
                      </button>
                    </div>
                  </div>
                  <p className="mt-2 text-center text-[10px] text-[#52525B]">Answers should be verified against the cited source passages.</p>
                </form>
              </div>
            </div>
          </section>
        )}
      </div>

      <Dialog open={selectorOpen} onOpenChange={setSelectorOpen}>
        <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-hidden border border-white/10 bg-[#0B0B0D] p-0 text-white sm:max-w-xl">
          <DialogHeader className="border-b border-white/8 px-5 py-5 text-left sm:px-6">
            <DialogTitle className="text-lg tracking-[-0.025em]">Choose document context</DialogTitle>
            <DialogDescription className="text-[#8B8B95]">Add or remove sources without clearing this conversation.</DialogDescription>
          </DialogHeader>
          <DocumentPicker documents={documents} selectedIds={selectedIds} onToggle={toggleDocument} compact />
          <div className="flex items-center justify-between border-t border-white/8 bg-[#08080A] px-5 py-4 sm:px-6">
            <p className="text-xs text-[#71717A]">{selectedIds.length} selected</p>
            <button type="button" onClick={() => setSelectorOpen(false)} className="h-10 rounded-lg bg-[#2DD4BF] px-4 text-sm font-semibold text-[#04100E] hover:bg-[#5EEAD4] active:translate-y-px">Update context</button>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}

function DocumentSetup({ documents, selectedIds, onToggle, onStart }: { documents: WorkspaceDocument[]; selectedIds: string[]; onToggle: (id: string) => void; onStart: () => void }) {
  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-7 sm:py-14 lg:px-10">
      <div className="max-w-2xl">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#2DD4BF]/20 bg-[#09100F] text-[#5EEAD4]"><ChatCenteredDots className="h-5 w-5" weight="fill" /></span>
        <h1 className="mt-6 text-[clamp(2.25rem,5vw,4.25rem)] font-medium leading-[1] tracking-[-0.05em]">Choose what Nexus can read.</h1>
        <p className="mt-4 max-w-xl text-base leading-7 text-[#A1A1AA]">Select one or more documents for this conversation. You can change the selection later.</p>
      </div>
      <div className="mt-9 overflow-hidden rounded-xl border border-white/10 bg-[#0B0B0D]">
        <DocumentPicker documents={documents} selectedIds={selectedIds} onToggle={onToggle} />
        <div className="flex flex-col gap-3 border-t border-white/8 bg-[#08080A] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p className="text-xs text-[#71717A]">{selectedIds.length ? `${selectedIds.length} ${selectedIds.length === 1 ? "document" : "documents"} in context` : "Select at least one ready document"}</p>
          <button type="button" onClick={onStart} disabled={selectedIds.length === 0} className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#2DD4BF] px-5 text-sm font-semibold text-[#04100E] hover:bg-[#5EEAD4] active:translate-y-px disabled:cursor-not-allowed disabled:bg-[#263B38] disabled:text-[#718984]">
            Start chat
            <ArrowUp className="h-4 w-4 rotate-90" weight="bold" />
          </button>
        </div>
      </div>
    </section>
  );
}

function DocumentPicker({ documents, selectedIds, onToggle, compact = false }: { documents: WorkspaceDocument[]; selectedIds: string[]; onToggle: (id: string) => void; compact?: boolean }) {
  const [query, setQuery] = useState("");
  const filtered = documents.filter((document) => document.originalName.toLowerCase().includes(query.toLowerCase()));
  const readyCount = documents.filter((document) => document.status === "READY").length;

  return (
    <div className={compact ? "min-h-0" : ""}>
      <div className="flex flex-col gap-3 border-b border-white/8 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <h2 className="text-sm font-semibold text-white">Workspace documents</h2>
          <p className="mt-1 text-xs text-[#71717A]">{readyCount} ready for questions</p>
        </div>
        <label className="relative block sm:w-64">
          <MagnifyingGlass className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-[#5E5E66]" />
          <span className="sr-only">Search documents</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search documents" className="h-9 w-full rounded-lg border border-white/10 bg-[#111113] pl-9 pr-3 text-xs text-white outline-none placeholder:text-[#5E5E66] focus:border-[#2DD4BF]/45" />
        </label>
      </div>
      <div className={`${compact ? "max-h-[55dvh]" : "max-h-[27rem]"} overflow-y-auto p-2`}>
        {filtered.length ? filtered.map((document) => {
          const selectable = document.status === "READY";
          const selected = selectedIds.includes(document.id);
          const Icon = document.mimeType === "application/pdf" ? FilePdf : FileText;
          return (
            <button key={document.id} type="button" disabled={!selectable} onClick={() => onToggle(document.id)} className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left transition-colors ${selected ? "bg-[#2DD4BF]/9" : selectable ? "hover:bg-white/[0.035]" : "cursor-not-allowed opacity-45"}`}>
              <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${selected ? "bg-[#2DD4BF]/12 text-[#5EEAD4]" : "bg-white/5 text-[#8B8B95]"}`}><Icon className="h-5 w-5" weight="duotone" /></span>
              <span className="min-w-0 flex-1">
                <span className={`block truncate text-sm font-medium ${selected ? "text-white" : "text-[#D4D4D8]"}`}>{document.originalName}</span>
                <span className="mt-1 block text-[11px] text-[#71717A]">{selectable ? "Ready to use" : document.status.replaceAll("_", " ").toLowerCase()}</span>
              </span>
              <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${selected ? "border-[#2DD4BF] bg-[#2DD4BF] text-[#04100E]" : "border-white/15 text-transparent"}`}><Check className="h-3 w-3" weight="bold" /></span>
            </button>
          );
        }) : (
          <div className="flex min-h-40 flex-col items-center justify-center px-6 text-center">
            {documents.length === 0 ? <FileText className="h-6 w-6 text-[#3F3F46]" /> : <MagnifyingGlass className="h-6 w-6 text-[#3F3F46]" />}
            <p className="mt-3 text-sm text-[#8B8B95]">{documents.length === 0 ? "Your workspace has no documents yet." : "No documents match that search."}</p>
            {documents.length === 0 ? <Link href="/workspace/documents" className="mt-3 text-xs font-semibold text-[#5EEAD4] hover:text-[#99F6E4]">Upload a document</Link> : null}
          </div>
        )}
      </div>
    </div>
  );
}

function AskNav({ documentCount }: { documentCount: number }) {
  return (
    <>
      <Link href="/" className="flex w-fit items-center gap-2.5 px-2" aria-label="NexusOps home">
        <span className="h-2.5 w-2.5 rounded-full bg-[#2DD4BF] shadow-[0_0_18px_rgba(45,212,191,0.65)]" />
        <span className="text-sm font-semibold tracking-[0.17em]">NEXUS<span className="text-[#71717A]">/OPS</span></span>
      </Link>
      <nav className="mt-10 space-y-1" aria-label="Workspace navigation">
        <Link href="/workspace" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[#8B8B95] hover:bg-white/5 hover:text-white"><House className="h-4 w-4" />Overview</Link>
        <Link href="/workspace/documents" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[#8B8B95] hover:bg-white/5 hover:text-white"><FileText className="h-4 w-4" />Documents</Link>
        <Link href="/workspace/ask" aria-current="page" className="flex items-center gap-3 rounded-lg bg-[#2DD4BF]/10 px-3 py-2.5 text-sm text-[#5EEAD4]"><ChatCenteredDots className="h-4 w-4" weight="fill" />Ask Nexus</Link>
      </nav>
      <div className="mt-auto rounded-xl border border-white/8 bg-[#0D0D0F] p-4">
        <Sparkle className="h-4 w-4 text-[#5EEAD4]" />
        <p className="mt-3 text-xs leading-5 text-[#71717A]">Choose from {documentCount} stored {documentCount === 1 ? "document" : "documents"} and keep the answer grounded.</p>
      </div>
    </>
  );
}
