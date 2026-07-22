"use client";

import { UserButton } from "@clerk/nextjs";
import {
  ArrowSquareOut,
  ChatCenteredDots,
  DownloadSimple,
  FilePdf,
  FileText,
  House,
  MagnifyingGlass,
  Plus,
  SidebarSimple,
  SpinnerGap,
  Trash,
  WarningCircle,
  X,
} from "@phosphor-icons/react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { DocumentUpload } from "./document-upload";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { WorkspaceDocument } from "@/lib/documents/types";

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

function fileType(document: WorkspaceDocument) {
  if (document.mimeType === "application/pdf") return "PDF";
  if (document.mimeType.startsWith("image/")) return "Image";
  return "Document";
}

export function DocumentsShell({ initialDocuments }: { initialDocuments: WorkspaceDocument[] }) {
  const [documents, setDocuments] = useState(initialDocuments);
  const [queuedDocumentIds, setQueuedDocumentIds] = useState<Set<string>>(
    () => new Set(),
  );
  const statusesRef = useRef(
    new Map(initialDocuments.map((document) => [document.id, document.status])),
  );
  const [query, setQuery] = useState("");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<WorkspaceDocument | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const hasProcessingDocuments = documents.some(
    (document) =>
      ["OCR_PROCESSING", "OCR_COMPLETED", "CHUNKING", "EMBEDDING"].includes(
        document.status,
      ) || queuedDocumentIds.has(document.id),
  );

  useEffect(() => {
    if (!hasProcessingDocuments) return;

    let cancelled = false;

    const refreshDocuments = async () => {
      try {
        const response = await fetch("/api/documents", { cache: "no-store" });

        if (!response.ok) return;

        const payload = (await response.json()) as { documents?: WorkspaceDocument[] };

        if (!cancelled && payload.documents) {
          const completedDocumentIds: string[] = [];

          for (const document of payload.documents) {
            const previousStatus = statusesRef.current.get(document.id);

            if (["READY", "FAILED"].includes(document.status)) {
              completedDocumentIds.push(document.id);
            }

            if (previousStatus && previousStatus !== document.status) {
              if (document.status === "READY") {
                toast.success("Document ready", {
                  description: `${document.originalName} is indexed and ready to search.`,
                });
              } else if (document.status === "FAILED") {
                toast.error("Document processing failed", {
                  description:
                    document.errorMessage ||
                    `${document.originalName} could not be processed.`,
                });
              }
            }
          }

          statusesRef.current = new Map(
            payload.documents.map((document) => [document.id, document.status]),
          );
          if (completedDocumentIds.length > 0) {
            setQueuedDocumentIds((current) => {
              const next = new Set(current);
              completedDocumentIds.forEach((documentId) => next.delete(documentId));
              return next;
            });
          }
          setDocuments(payload.documents);
        }
      } catch {
        // Keep the current table state and retry on the next interval.
      }
    };

    const interval = window.setInterval(refreshDocuments, 2500);
    void refreshDocuments();

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [hasProcessingDocuments]);

  const filteredDocuments = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return documents;
    return documents.filter((document) => document.originalName.toLowerCase().includes(normalized));
  }, [documents, query]);

  const handleUploaded = (document: WorkspaceDocument) => {
    setQueuedDocumentIds((current) => new Set(current).add(document.id));
    statusesRef.current.set(document.id, document.status);
    setDocuments((current) => [document, ...current]);
    setUploadDialogOpen(false);
  };

  const deleteDocument = async () => {
    if (!documentToDelete || isDeleting) return;

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/documents/${documentToDelete.id}`, {
        method: "DELETE",
      });
      const payload = (await response.json().catch(() => ({}))) as {
        error?: string;
      };

      if (!response.ok) {
        toast.error("Document not deleted", {
          description: payload.error || "The document could not be deleted. Please try again.",
        });
        return;
      }

      const deletedDocument = documentToDelete;
      statusesRef.current.delete(deletedDocument.id);
      setQueuedDocumentIds((current) => {
        const next = new Set(current);
        next.delete(deletedDocument.id);
        return next;
      });
      setDocuments((current) =>
        current.filter((document) => document.id !== deletedDocument.id),
      );
      setDocumentToDelete(null);
      toast.success("Document deleted", {
        description: `${deletedDocument.originalName} and its processed data were removed.`,
      });
    } catch {
      toast.error("Document not deleted", {
        description: "The connection was interrupted. Please try again.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <main className="nexus-page min-h-dvh bg-[#050505] text-white">
      <div className="nexus-workspace-grid pointer-events-none fixed inset-0 opacity-30" />

      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-white/8 bg-[#08080A]/95 px-4 py-5 backdrop-blur-xl lg:flex">
        <DocumentsNav documentCount={documents.length} onUpload={() => setUploadDialogOpen(true)} />
      </aside>

      {mobileNavOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button type="button" className="absolute inset-0 bg-black/70" aria-label="Close navigation" onClick={() => setMobileNavOpen(false)} />
          <aside className="relative flex h-full w-[min(20rem,88vw)] flex-col border-r border-white/10 bg-[#08080A] px-4 py-5 shadow-2xl shadow-black">
            <button type="button" onClick={() => setMobileNavOpen(false)} className="absolute right-4 top-5 rounded-lg p-2 text-[#A1A1AA] hover:bg-white/5 hover:text-white" aria-label="Close navigation">
              <X className="h-5 w-5" />
            </button>
            <DocumentsNav documentCount={documents.length} onUpload={() => setUploadDialogOpen(true)} />
          </aside>
        </div>
      ) : null}

      <div className="relative lg:pl-64">
        <header className="sticky top-0 z-20 flex h-17 items-center justify-between border-b border-white/8 bg-[#050505]/88 px-4 backdrop-blur-xl sm:px-7 lg:px-10">
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => setMobileNavOpen(true)} className="rounded-lg p-2 text-[#A1A1AA] hover:bg-white/5 hover:text-white focus-visible:outline-2 focus-visible:outline-[#5EEAD4] lg:hidden" aria-label="Open navigation">
              <SidebarSimple className="h-5 w-5" />
            </button>
            <div>
              <p className="text-sm font-medium text-white">Documents</p>
              <p className="hidden text-xs text-[#71717A] sm:block">Uploaded sources and processing status</p>
            </div>
          </div>
          <UserButton
            appearance={{
              elements: {
                userButtonBox: "h-9 w-9 rounded-lg",
                avatarBox: "h-9 w-9 rounded-lg",
                userButtonTrigger: "focus:ring-2 focus:ring-[#5EEAD4] focus:ring-offset-2 focus:ring-offset-[#050505]",
              },
            }}
          />
        </header>

        <div className="mx-auto w-full max-w-[1480px] px-4 pb-16 pt-9 sm:px-7 sm:pt-12 lg:px-10 lg:pb-20">
          {documents.length === 0 ? (
            <EmptyDocuments onUploaded={handleUploaded} />
          ) : (
            <>
              <section className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-3xl">
                  <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-[#5EEAD4]">Document library</p>
                  <h1 className="mt-4 text-balance text-[clamp(2.4rem,5vw,4.6rem)] font-medium leading-[0.98] tracking-[-0.05em] text-white">Every source, in one place.</h1>
                  <p className="mt-5 max-w-xl text-base leading-7 text-[#A1A1AA] sm:text-lg">Open uploaded files, download originals, or add another source to your workspace.</p>
                </div>
                <button type="button" onClick={() => setUploadDialogOpen(true)} className="inline-flex h-11 w-fit items-center gap-2 rounded-lg bg-[#2DD4BF] px-5 text-sm font-semibold text-[#04100E] transition-colors hover:bg-[#5EEAD4] active:translate-y-px">
                  <Plus className="h-4 w-4" weight="bold" />
                  Upload document
                </button>
              </section>

              <section aria-labelledby="document-table-heading" className="mt-10 overflow-hidden rounded-xl border border-white/10 bg-[#0B0B0D]">
                <div className="flex flex-col gap-4 border-b border-white/8 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
                  <div>
                    <h2 id="document-table-heading" className="text-lg font-semibold tracking-[-0.025em] text-white">Uploaded documents</h2>
                    <p className="mt-1 text-sm text-[#71717A]">{documents.length} {documents.length === 1 ? "document" : "documents"}</p>
                  </div>
                  <label className="flex h-10 w-full items-center gap-2 rounded-lg border border-white/10 bg-[#08080A] px-3 text-[#71717A] focus-within:border-[#2DD4BF]/45 sm:w-72">
                    <MagnifyingGlass className="h-4 w-4 shrink-0" />
                    <span className="sr-only">Search documents</span>
                    <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search documents" className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-[#52525B]" />
                  </label>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[780px] border-collapse text-left">
                    <thead className="bg-[#0E0E11] font-mono text-[9px] uppercase tracking-[0.12em] text-[#71717A]">
                      <tr>
                        <th className="px-7 py-3 font-medium">Document</th>
                        <th className="px-4 py-3 font-medium">Type</th>
                        <th className="px-4 py-3 font-medium">Size</th>
                        <th className="px-4 py-3 font-medium">Uploaded</th>
                        <th className="px-4 py-3 font-medium">Status</th>
                        <th className="px-7 py-3 text-right font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/7">
                      {filteredDocuments.map((document) => (
                        <tr key={document.id} className="transition-colors hover:bg-white/[0.025]">
                          <td className="px-7 py-4">
                            <div className="flex min-w-0 items-center gap-3">
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#2DD4BF]/8 text-[#5EEAD4]">
                                {document.mimeType === "application/pdf" ? <FilePdf className="h-4.5 w-4.5" weight="duotone" /> : <FileText className="h-4.5 w-4.5" weight="duotone" />}
                              </div>
                              <span className="max-w-sm truncate text-sm font-medium text-[#E4E4E7]">{document.originalName}</span>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-xs text-[#A1A1AA]">{fileType(document)}</td>
                          <td className="px-4 py-4 text-xs text-[#A1A1AA]">{formatBytes(document.sizeBytes)}</td>
                          <td className="px-4 py-4 text-xs text-[#A1A1AA]">{formatDate(document.createdAt)}</td>
                          <td className="px-4 py-4"><DocumentStatus status={document.status} errorMessage={document.errorMessage} /></td>
                          <td className="px-7 py-4">
                            <div className="flex items-center justify-end gap-2">
                              <a href={`/api/documents/${document.id}/file`} target="_blank" rel="noreferrer" className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-white/10 px-3 text-xs font-medium text-[#D4D4D8] transition-colors hover:border-[#2DD4BF]/30 hover:bg-[#2DD4BF]/8 hover:text-white">
                                <ArrowSquareOut className="h-3.5 w-3.5" />
                                View
                              </a>
                              <a href={`/api/documents/${document.id}/file?download=1`} className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-white/10 px-3 text-xs font-medium text-[#D4D4D8] transition-colors hover:border-[#2DD4BF]/30 hover:bg-[#2DD4BF]/8 hover:text-white">
                                <DownloadSimple className="h-3.5 w-3.5" />
                                Download
                              </a>
                              <button
                                type="button"
                                onClick={() => setDocumentToDelete(document)}
                                className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-red-400/15 px-3 text-xs font-medium text-red-300 transition-colors hover:border-red-400/35 hover:bg-red-400/8 hover:text-red-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-300"
                              >
                                <Trash className="h-3.5 w-3.5" />
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredDocuments.length === 0 ? (
                    <div className="flex min-h-40 flex-col items-center justify-center px-6 text-center">
                      <MagnifyingGlass className="h-6 w-6 text-[#52525B]" />
                      <p className="mt-3 text-sm font-medium text-[#D4D4D8]">No documents match your search</p>
                    </div>
                  ) : null}
                </div>
              </section>
            </>
          )}
        </div>
      </div>

      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto border border-white/10 bg-[#0B0B0D] p-5 text-white shadow-[0_32px_120px_rgba(0,0,0,0.75)] sm:max-w-2xl sm:p-7">
          <DialogHeader className="pr-10">
            <DialogTitle className="text-xl font-semibold tracking-[-0.025em] text-white">Upload a document</DialogTitle>
            <DialogDescription className="leading-6 text-[#8B8B95]">Add another invoice, receipt, or business document to your workspace.</DialogDescription>
          </DialogHeader>
          <DocumentUpload showHeader={false} onUploaded={handleUploaded} />
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(documentToDelete)}
        onOpenChange={(open) => {
          if (!open && !isDeleting) setDocumentToDelete(null);
        }}
      >
        <DialogContent
          showCloseButton={!isDeleting}
          className="border border-red-400/15 bg-[#0B0B0D] p-0 text-white shadow-[0_32px_120px_rgba(0,0,0,0.8)] sm:max-w-md"
        >
          <div className="p-6 sm:p-7">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-red-400/20 bg-red-400/8 text-red-300">
              <WarningCircle className="h-5 w-5" weight="fill" />
            </div>
            <DialogHeader className="mt-5 pr-8 text-left">
              <DialogTitle className="text-xl font-semibold tracking-[-0.025em] text-white">
                Delete this document?
              </DialogTitle>
              <DialogDescription className="mt-1 leading-6 text-[#A1A1AA]">
                <span className="font-medium text-[#E4E4E7]">
                  {documentToDelete?.originalName}
                </span>{" "}
                will be permanently removed with its stored file, extracted text, chunks,
                embeddings, and related processing records. This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
          </div>
          <DialogFooter className="m-0 border-t border-white/8 bg-[#08080A] px-6 py-4 sm:px-7">
            <button
              type="button"
              disabled={isDeleting}
              onClick={() => setDocumentToDelete(null)}
              className="inline-flex h-10 items-center justify-center rounded-lg border border-white/10 px-4 text-sm font-medium text-[#D4D4D8] transition-colors hover:border-white/20 hover:bg-white/5 hover:text-white disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isDeleting}
              onClick={deleteDocument}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-red-500 px-4 text-sm font-semibold text-white transition-colors hover:bg-red-400 disabled:cursor-wait disabled:opacity-70"
            >
              {isDeleting ? (
                <SpinnerGap className="h-4 w-4 animate-spin motion-reduce:animate-none" />
              ) : (
                <Trash className="h-4 w-4" weight="bold" />
              )}
              {isDeleting ? "Deleting…" : "Delete permanently"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}

function EmptyDocuments({ onUploaded }: { onUploaded: (document: WorkspaceDocument) => void }) {
  return (
    <>
      <section className="max-w-3xl">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-[#5EEAD4]">Start your document library</p>
        <h1 className="mt-4 text-balance text-[clamp(2.4rem,5vw,4.6rem)] font-medium leading-[0.98] tracking-[-0.05em] text-white">Upload the first source your team needs.</h1>
        <p className="mt-5 max-w-xl text-base leading-7 text-[#A1A1AA] sm:text-lg">Invoices, receipts, reports, and business records become searchable from this library.</p>
      </section>
      <div className="mt-10 max-w-4xl">
        <DocumentUpload onUploaded={onUploaded} />
      </div>
    </>
  );
}

function DocumentStatus({
  status,
  errorMessage,
}: {
  status: string;
  errorMessage?: string | null;
}) {
  const isReady = status === "READY";
  const isFailed = status === "FAILED";
  return (
    <span title={isFailed ? errorMessage || "Processing failed" : undefined} className={`inline-flex rounded-md border px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.1em] ${isReady ? "border-[#2DD4BF]/25 bg-[#2DD4BF]/8 text-[#5EEAD4]" : isFailed ? "border-red-400/20 bg-red-400/8 text-red-300" : "border-white/10 bg-white/5 text-[#A1A1AA]"}`}>
      {status.replaceAll("_", " ").toLowerCase()}
    </span>
  );
}

function DocumentsNav({ documentCount, onUpload }: { documentCount: number; onUpload: () => void }) {
  return (
    <>
      <Link href="/" className="flex w-fit items-center gap-2.5 px-2" aria-label="NexusOps home">
        <span className="h-2.5 w-2.5 rounded-full bg-[#2DD4BF] shadow-[0_0_18px_rgba(45,212,191,0.65)]" />
        <span className="text-sm font-semibold tracking-[0.17em] text-white">NEXUS<span className="text-[#71717A]">/OPS</span></span>
      </Link>
      <nav aria-label="Workspace navigation" className="mt-10 space-y-1">
        <Link href="/workspace" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[#8B8B95] transition-colors hover:bg-white/5 hover:text-white"><House className="h-4 w-4" />Overview</Link>
        <Link href="/workspace/documents" aria-current="page" className="flex items-center gap-3 rounded-lg bg-[#2DD4BF]/10 px-3 py-2.5 text-sm text-[#5EEAD4]"><FileText className="h-4 w-4" weight="fill" />Documents</Link>
        <button type="button" disabled className="flex w-full cursor-not-allowed items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-[#52525B]"><ChatCenteredDots className="h-4 w-4" />Ask Nexus</button>
      </nav>
      <div className="mt-auto rounded-xl border border-white/8 bg-[#0D0D0F] p-4">
        <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#5EEAD4]">{documentCount} stored</p>
        <p className="mt-2 text-xs leading-5 text-[#71717A]">Add another source to expand your operational memory.</p>
        <button type="button" onClick={onUpload} className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-[#D4D4D8] hover:text-white"><Plus className="h-3.5 w-3.5" />Upload document</button>
      </div>
    </>
  );
}
