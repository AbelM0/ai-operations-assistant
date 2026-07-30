"use client";

import { useTranslation } from "react-i18next";
import { DocumentUpload } from "../document-upload";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { DocumentUploadedHandler } from "./types";

type UploadDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUploaded: DocumentUploadedHandler;
};

export function UploadDialog({
  open,
  onOpenChange,
  onUploaded,
}: UploadDialogProps) {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto border border-white/10 bg-[#0B0B0D] p-5 text-white shadow-[0_32px_120px_rgba(0,0,0,0.75)] sm:max-w-2xl sm:p-7">
        <DialogHeader className="pr-10">
          <DialogTitle className="text-xl font-semibold tracking-[-0.025em] text-white">
            {t("workspace.uploadDocument")}
          </DialogTitle>
          <DialogDescription className="leading-6 text-[#8B8B95]">
            {t("workspace.uploadDescription")}
          </DialogDescription>
        </DialogHeader>
        <DocumentUpload showHeader={false} onUploaded={onUploaded} />
      </DialogContent>
    </Dialog>
  );
}
