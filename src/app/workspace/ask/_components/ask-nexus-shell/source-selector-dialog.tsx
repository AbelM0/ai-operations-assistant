"use client";

import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { WorkspaceDocument } from "@/lib/documents/types";
import { DocumentPicker } from "./document-picker";

type SourceSelectorDialogProps = {
  open: boolean;
  documents: WorkspaceDocument[];
  selectedIds: string[];
  onOpenChange: (open: boolean) => void;
  onToggle: (id: string) => void;
};

export function SourceSelectorDialog({
  open,
  documents,
  selectedIds,
  onOpenChange,
  onToggle,
}: SourceSelectorDialogProps) {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-hidden border border-white/10 bg-[#0B0B0D] p-0 text-white sm:max-w-xl">
        <DialogHeader className="border-b border-white/8 px-5 py-5 text-left sm:px-6">
          <DialogTitle className="text-lg tracking-[-0.025em]">
            {t("chat.chooseContext")}
          </DialogTitle>
          <DialogDescription className="text-[#8B8B95]">
            {t("chat.chooseContextDescription")}
          </DialogDescription>
        </DialogHeader>
        <DocumentPicker
          documents={documents}
          selectedIds={selectedIds}
          onToggle={onToggle}
          compact
        />
        <div className="flex items-center justify-between border-t border-white/8 bg-[#08080A] px-5 py-4 sm:px-6">
          <p className="text-xs text-[#71717A]">
            {t("chat.selected", { count: selectedIds.length })}
          </p>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="h-10 rounded-lg bg-[#2DD4BF] px-4 text-sm font-semibold text-[#04100E] hover:bg-[#5EEAD4] active:translate-y-px"
          >
            {t("chat.updateContext")}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
