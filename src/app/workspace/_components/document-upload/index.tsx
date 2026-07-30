"use client";

import { useRef, useState, type DragEvent } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  startDocumentProcessing,
  uploadDocument,
} from "./actions";
import {
  acceptedDocumentTypes,
  maximumDocumentSize,
} from "./constants";
import { FileDropzone } from "./file-dropzone";
import type { DocumentUploadProps } from "./types";
import { UploadHeader } from "./upload-header";

export function DocumentUpload({
  onUploaded,
  showHeader = true,
}: DocumentUploadProps) {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const resetSelection = () => {
    setSelectedFile(null);
    setProgress(0);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const chooseFile = (file?: File) => {
    if (!file || isUploading) return;

    if (!acceptedDocumentTypes.includes(file.type)) {
      setSelectedFile(null);
      setError(t("upload.invalidType"));
      return;
    }

    if (file.size > maximumDocumentSize || file.size === 0) {
      setSelectedFile(null);
      setError(t("upload.invalidSize"));
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

  const handleUpload = () => {
    if (!selectedFile || isUploading) return;

    const file = selectedFile;
    setError(null);
    setProgress(0);
    setIsUploading(true);

    uploadDocument(file, {
      onProgress: setProgress,
      onSuccess: (document) => {
        setIsUploading(false);
        setProgress(100);
        onUploaded(document);
        toast.success(t("upload.uploaded"), {
          description: t("upload.uploadedDescription", { name: file.name }),
        });
        resetSelection();

        void startDocumentProcessing(document.id).catch((cause: unknown) => {
          toast.error(t("upload.processingDidNotStart"), {
            description:
              cause instanceof Error
                ? cause.message
                : t("upload.restartHint", { name: document.originalName }),
          });
        });
      },
      onFailure: (message) => {
        setIsUploading(false);
        setProgress(0);
        toast.error(t("upload.failed"), {
          description: message || t("upload.failedDescription"),
        });
      },
      onInterrupted: () => {
        setIsUploading(false);
        setProgress(0);
        toast.error(t("upload.interrupted"), {
          description: t("upload.interruptedDescription"),
        });
      },
    });
  };

  return (
    <section
      aria-labelledby={showHeader ? "upload-heading" : undefined}
      className={
        showHeader
          ? "overflow-hidden rounded-xl border border-white/10 bg-[#0B0B0D]"
          : "bg-[#0B0B0D]"
      }
    >
      {showHeader ? <UploadHeader /> : null}

      <div className={showHeader ? "p-4 sm:p-7" : "pt-3"}>
        <FileDropzone
          inputRef={inputRef}
          selectedFile={selectedFile}
          isDragging={isDragging}
          isUploading={isUploading}
          progress={progress}
          onChooseFile={chooseFile}
          onDrop={handleDrop}
          onDraggingChange={setIsDragging}
          onUpload={handleUpload}
          onRemove={resetSelection}
        />

        {error ? (
          <p role="alert" className="mt-3 text-sm text-red-400">
            {error}
          </p>
        ) : null}
      </div>
    </section>
  );
}
