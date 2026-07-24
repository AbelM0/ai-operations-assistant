"use client";

import { useRef, useState, type DragEvent } from "react";
import {
  CheckCircle,
  File,
  FilePdf,
  ImageSquare,
  UploadSimple,
  X,
} from "@phosphor-icons/react";
import { toast } from "sonner";
import type { WorkspaceDocument } from "@/lib/documents/types";

const acceptedTypes = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
];

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

type DocumentUploadProps = {
  onUploaded: (document: WorkspaceDocument) => void;
  showHeader?: boolean;
};

async function ensureProcessingStarted(document: WorkspaceDocument) {
  try {
    const response = await fetch(`/api/documents/${document.id}`, {
      method: "POST",
    });

    // The upload route also schedules processing. A conflict here means that
    // worker won the claim before this reliability fallback reached the API.
    if (response.ok || response.status === 409) return;

    const payload = (await response.json().catch(() => ({}))) as {
      error?: string;
    };
    toast.error("Processing did not start", {
      description:
        payload.error ||
        `Open ${document.originalName} and use Restart processing.`,
    });
  } catch {
    toast.error("Processing connection interrupted", {
      description: `Open ${document.originalName} and use Restart processing.`,
    });
  }
}

export function DocumentUpload({ onUploaded, showHeader = true }: DocumentUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const chooseFile = (file?: File) => {
    if (!file || isUploading) return;
    if (!acceptedTypes.includes(file.type)) {
      setSelectedFile(null);
      setError("Choose a PDF, JPG, PNG, or WebP file.");
      return;
    }
    if (file.size > 20 * 1024 * 1024 || file.size === 0) {
      setSelectedFile(null);
      setError("Choose a file between 1 byte and 20 MB.");
      return;
    }
    setError(null);
    setProgress(0);
    setSelectedFile(file);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    chooseFile(event.dataTransfer.files[0]);
  };

  const uploadFile = () => {
    if (!selectedFile || isUploading) return;

    setError(null);
    setProgress(0);
    setIsUploading(true);

    const request = new XMLHttpRequest();
    const body = new FormData();
    body.append("file", selectedFile);

    request.open("POST", "/api/documents");
    request.responseType = "json";
    request.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        setProgress(Math.min(95, Math.round((event.loaded / event.total) * 95)));
      }
    };
    request.onload = () => {
      setIsUploading(false);
      if (request.status >= 200 && request.status < 300 && request.response?.document) {
        const uploadedDocument = request.response.document as WorkspaceDocument;
        setProgress(100);
        void ensureProcessingStarted(uploadedDocument);
        onUploaded(uploadedDocument);
        toast.success("Document uploaded", {
          description: `${selectedFile.name} was added to your workspace.`,
        });
        setSelectedFile(null);
        if (inputRef.current) inputRef.current.value = "";
        return;
      }
      setProgress(0);
      toast.error("Upload failed", {
        description:
          request.response?.error ||
          "The document could not be uploaded. Please try again.",
      });
    };
    request.onerror = () => {
      setIsUploading(false);
      setProgress(0);
      toast.error("Connection interrupted", {
        description: "The upload did not finish. Check your connection and try again.",
      });
    };
    request.send(body);
  };

  return (
    <section
      aria-labelledby={showHeader ? "upload-heading" : undefined}
      className={showHeader ? "overflow-hidden rounded-xl border border-white/10 bg-[#0B0B0D]" : "bg-[#0B0B0D]"}
    >
      {showHeader ? (
        <div className="flex flex-col gap-4 border-b border-white/8 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
          <div>
            <h2 id="upload-heading" className="text-lg font-semibold tracking-[-0.025em] text-white">
              Add your first document
            </h2>
            <p className="mt-1 text-sm leading-6 text-[#8B8B95]">
              Upload a file to start building your searchable workspace.
            </p>
          </div>
          <div className="flex items-center gap-2 self-start font-mono text-[10px] uppercase tracking-[0.14em] text-[#5EEAD4]">
            <CheckCircle className="h-4 w-4" weight="fill" />
            Private workspace
          </div>
        </div>
      ) : null}

      <div className={showHeader ? "p-4 sm:p-7" : "pt-3"}>
        <div
          onDragEnter={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragOver={(event) => event.preventDefault()}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`relative flex min-h-64 flex-col items-center justify-center rounded-xl border border-dashed px-6 py-10 text-center transition-colors duration-200 ${
            isDragging
              ? "border-[#2DD4BF] bg-[#2DD4BF]/8"
              : "border-white/14 bg-[#08080A] hover:border-[#2DD4BF]/45"
          }`}
        >
          <input
            ref={inputRef}
            className="sr-only"
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.webp"
            disabled={isUploading}
            onChange={(event) => chooseFile(event.target.files?.[0])}
            aria-label="Choose a business document"
          />

          {selectedFile ? (
            <div className="flex w-full max-w-lg flex-col items-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#2DD4BF]/10 text-[#5EEAD4]">
                {selectedFile.type === "application/pdf" ? (
                  <FilePdf className="h-7 w-7" weight="duotone" />
                ) : (
                  <ImageSquare className="h-7 w-7" weight="duotone" />
                )}
              </div>
              <p className="mt-5 max-w-full truncate text-base font-medium text-white">{selectedFile.name}</p>
              <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.12em] text-[#71717A]">
                {formatBytes(selectedFile.size)} ready
              </p>

              <div className="mt-6 w-full max-w-sm" aria-live="polite">
                <div className="flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.12em] text-[#71717A]">
                  <span>{isUploading ? "Uploading securely" : "Ready to upload"}</span>
                  <span>{progress}%</span>
                </div>
                <div
                  role="progressbar"
                  aria-label="Document upload progress"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={progress}
                  className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/8"
                >
                  <div
                    className="h-full rounded-full bg-[#2DD4BF] transition-[width] duration-200"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              <div className="mt-6 flex w-full max-w-sm flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  onClick={uploadFile}
                  disabled={isUploading}
                  className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-[#2DD4BF] px-5 text-sm font-semibold text-[#04100E] transition-colors hover:bg-[#5EEAD4] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5EEAD4] active:translate-y-px disabled:cursor-wait disabled:opacity-70"
                >
                  <UploadSimple className="h-4 w-4" weight="bold" />
                  {isUploading ? `Uploading ${progress}%` : "Upload document"}
                </button>
                <button
                  type="button"
                  disabled={isUploading}
                  onClick={() => {
                    setSelectedFile(null);
                    setProgress(0);
                    if (inputRef.current) inputRef.current.value = "";
                  }}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-white/10 px-5 text-sm font-medium text-[#D4D4D8] transition-colors hover:border-white/20 hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5EEAD4] active:translate-y-px disabled:opacity-50"
                >
                  <X className="h-4 w-4" />
                  Remove
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-[#2DD4BF]/20 bg-[#2DD4BF]/8 text-[#5EEAD4]">
                <UploadSimple className="h-7 w-7" weight="duotone" />
              </div>
              <p className="mt-5 text-lg font-medium tracking-[-0.02em] text-white">Drop a document here</p>
              <p className="mt-2 max-w-sm text-sm leading-6 text-[#8B8B95]">
                Add an invoice, receipt, or business document from your device.
              </p>
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#2DD4BF] px-5 text-sm font-semibold text-[#04100E] transition-colors hover:bg-[#5EEAD4] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5EEAD4] active:translate-y-px"
              >
                <File className="h-4 w-4" weight="bold" />
                Choose document
              </button>
              <p className="mt-4 font-mono text-[9px] uppercase tracking-[0.14em] text-[#52525B]">
                PDF, JPG, PNG, or WebP up to 20 MB
              </p>
            </>
          )}
        </div>

        {error ? (
          <p role="alert" className="mt-3 text-sm text-red-400">
            {error}
          </p>
        ) : null}
      </div>
    </section>
  );
}
