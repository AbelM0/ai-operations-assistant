"use client";

import { UserButton } from "@clerk/nextjs";
import {
  ArrowRight,
  ChatCenteredDots,
  FileText,
  FolderSimple,
  House,
  Lightning,
  Receipt,
  SidebarSimple,
  X,
} from "@phosphor-icons/react";
import Link from "next/link";
import { useState } from "react";
import { DocumentUpload } from "./document-upload";

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
  { label: "Overview", icon: House, active: true },
  { label: "Documents", icon: FileText },
  { label: "Ask Nexus", icon: ChatCenteredDots },
];

export function WorkspaceShell({ firstName }: { firstName: string }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <main className="nexus-page min-h-dvh bg-[#050505] text-white">
      <div className="nexus-workspace-grid pointer-events-none fixed inset-0 opacity-30" />

      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-white/8 bg-[#08080A]/95 px-4 py-5 backdrop-blur-xl lg:flex">
        <WorkspaceNav />
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
            <WorkspaceNav />
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
            <span className="hidden font-mono text-[9px] uppercase tracking-[0.14em] text-[#71717A] sm:block">
              Protected session
            </span>
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
            <DocumentUpload />

            <aside className="rounded-xl border border-white/10 bg-[#0B0B0D] p-5 sm:p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 text-[#5EEAD4]">
                <Lightning className="h-5 w-5" weight="duotone" />
              </div>
              <h2 className="mt-5 text-lg font-semibold tracking-[-0.025em] text-white">What happens next</h2>
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
            <h2 id="guidance-heading" className="text-lg font-semibold tracking-[-0.025em] text-white">
              A useful place to start
            </h2>
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

          <section aria-labelledby="recent-heading" className="mt-6 rounded-xl border border-white/10 bg-[#0B0B0D]">
            <div className="flex items-center justify-between border-b border-white/8 px-5 py-5 sm:px-7">
              <div>
                <h2 id="recent-heading" className="text-lg font-semibold tracking-[-0.025em] text-white">Recent documents</h2>
                <p className="mt-1 text-sm text-[#71717A]">Files you add will appear here.</p>
              </div>
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#52525B]">0 files</span>
            </div>
            <div className="flex min-h-44 flex-col items-center justify-center px-5 py-9 text-center">
              <FileText className="h-7 w-7 text-[#52525B]" weight="duotone" />
              <p className="mt-4 text-sm font-medium text-[#D4D4D8]">Your document library is empty</p>
              <p className="mt-1 max-w-md text-xs leading-5 text-[#71717A]">
                Add a file above. NexusOps will keep its processing status and source details visible here.
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

function WorkspaceNav() {
  return (
    <>
      <Link href="/" className="flex w-fit items-center gap-2.5 px-2" aria-label="NexusOps home">
        <span className="h-2.5 w-2.5 rounded-full bg-[#2DD4BF] shadow-[0_0_18px_rgba(45,212,191,0.65)]" />
        <span className="text-sm font-semibold tracking-[0.17em] text-white">
          NEXUS<span className="text-[#71717A]">/OPS</span>
        </span>
      </Link>

      <nav aria-label="Workspace navigation" className="mt-10 space-y-1">
        {navItems.map(({ label, icon: Icon, active }) => (
          <button
            key={label}
            type="button"
            aria-current={active ? "page" : undefined}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
              active ? "bg-[#2DD4BF]/10 text-[#5EEAD4]" : "text-[#8B8B95] hover:bg-white/5 hover:text-white"
            }`}
          >
            <Icon className="h-4 w-4" weight={active ? "fill" : "regular"} />
            {label}
          </button>
        ))}
      </nav>

      <div className="mt-auto rounded-xl border border-white/8 bg-[#0D0D0F] p-4">
        <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#5EEAD4]">Workspace ready</p>
        <p className="mt-2 text-xs leading-5 text-[#71717A]">Add your first source to activate document search.</p>
        <a href="#upload-heading" className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-[#D4D4D8] hover:text-white">
          Add document
          <ArrowRight className="h-3.5 w-3.5" weight="bold" />
        </a>
      </div>
    </>
  );
}
