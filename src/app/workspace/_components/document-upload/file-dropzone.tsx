"use client";

import {
  File,
  FilePdf,
  ImageSquare,
  UploadSimple,
  X,
} from "@phosphor-icons/react";
import type { DragEvent, RefObject } from "react";
import { useTranslation } from "react-i18next";
import { formatBytes } from "./utils";

type FileDropzoneProps = {
  inputRef: RefObject<HTMLInputElement | null>;
  selectedFile: File | null;
  isDragging: boolean;
  isUploading: boolean;
  progress: number;
  onChooseFile: (file?: File) => void;
  onDrop: (event: DragEvent<HTMLDivElement>) => void;
  onDraggingChange: (isDragging: boolean) => void;
  onUpload: () => void;
  onRemove: () => void;
};

export function FileDropzone({
  inputRef,
  selectedFile,
  isDragging,
  isUploading,
  progress,
  onChooseFile,
  onDrop,
  onDraggingChange,
  onUpload,
  onRemove,
}: FileDropzoneProps) {
  const { t } = useTranslation();

  return (
    <div
      onDragEnter={(event) => {
        event.preventDefault();
        onDraggingChange(true);
      }}
      onDragOver={(event) => event.preventDefault()}
      onDragLeave={() => onDraggingChange(false)}
      onDrop={onDrop}
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
        onChange={(event) => onChooseFile(event.target.files?.[0])}
        aria-label={t("upload.chooseAria")}
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
          <p className="mt-5 max-w-full truncate text-base font-medium text-white">
            {selectedFile.name}
          </p>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.12em] text-[#71717A]">
            {t("upload.ready", { size: formatBytes(selectedFile.size) })}
          </p>

          <div className="mt-6 w-full max-w-sm" aria-live="polite">
            <div className="flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.12em] text-[#71717A]">
              <span>
                {isUploading
                  ? t("upload.uploadingSecurely")
                  : t("upload.readyToUpload")}
              </span>
              <span>{progress}%</span>
            </div>
            <div
              role="progressbar"
              aria-label={t("upload.progress")}
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
              onClick={onUpload}
              disabled={isUploading}
              className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-[#2DD4BF] px-5 text-sm font-semibold text-[#04100E] transition-colors hover:bg-[#5EEAD4] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5EEAD4] active:translate-y-px disabled:cursor-wait disabled:opacity-70"
            >
              <UploadSimple className="h-4 w-4" weight="bold" />
              {isUploading
                ? t("upload.uploading", { progress })
                : t("upload.uploadDocument")}
            </button>
            <button
              type="button"
              disabled={isUploading}
              onClick={onRemove}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-white/10 px-5 text-sm font-medium text-[#D4D4D8] transition-colors hover:border-white/20 hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5EEAD4] active:translate-y-px disabled:opacity-50"
            >
              <X className="h-4 w-4" />
              {t("common.remove")}
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-[#2DD4BF]/20 bg-[#2DD4BF]/8 text-[#5EEAD4]">
            <UploadSimple className="h-7 w-7" weight="duotone" />
          </div>
          <p className="mt-5 text-lg font-medium tracking-[-0.02em] text-white">
            {t("upload.dropHere")}
          </p>
          <p className="mt-2 max-w-sm text-sm leading-6 text-[#8B8B95]">
            {t("upload.dropDescription")}
          </p>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#2DD4BF] px-5 text-sm font-semibold text-[#04100E] transition-colors hover:bg-[#5EEAD4] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5EEAD4] active:translate-y-px"
          >
            <File className="h-4 w-4" weight="bold" />
            {t("upload.chooseDocument")}
          </button>
          <p className="mt-4 font-mono text-[9px] uppercase tracking-[0.14em] text-[#52525B]">
            {t("upload.limits")}
          </p>
        </>
      )}
    </div>
  );
}
