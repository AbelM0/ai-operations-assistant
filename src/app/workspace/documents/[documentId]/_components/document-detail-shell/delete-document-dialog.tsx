"use client";

import {
  SpinnerGap,
  Trash,
  WarningCircle,
} from "@phosphor-icons/react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type DeleteDocumentDialogProps = {
  open: boolean;
  isDeleting: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete: () => void;
};

export function DeleteDocumentDialog({
  open,
  isDeleting,
  onOpenChange,
  onDelete,
}: DeleteDocumentDialogProps) {
  const { t } = useTranslation();

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!isDeleting) onOpenChange(nextOpen);
      }}
    >
      <DialogContent
        showCloseButton={!isDeleting}
        className="border border-red-400/15 bg-[#0B0B0D] p-4 text-white sm:max-w-md"
      >
        <div className="p-6">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-400/8 text-red-300">
            <WarningCircle className="h-5 w-5" weight="fill" />
          </div>
          <DialogHeader className="mt-5 text-left">
            <DialogTitle>{t("detail.deleteTitle")}</DialogTitle>
            <DialogDescription className="mt-1 leading-6 text-[#A1A1AA]">
              {t("detail.deleteDescription")}
            </DialogDescription>
          </DialogHeader>
        </div>
        <DialogFooter className="border-t border-white/8 bg-[#08080A] px-6 py-4">
          <button
            type="button"
            disabled={isDeleting}
            onClick={() => onOpenChange(false)}
            className="h-10 rounded-lg border border-white/10 px-4 text-sm text-[#D4D4D8]"
          >
            {t("common.cancel")}
          </button>
          <button
            type="button"
            disabled={isDeleting}
            onClick={onDelete}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-red-500 px-4 text-sm font-semibold text-white disabled:opacity-60"
          >
            {isDeleting ? (
              <SpinnerGap className="h-4 w-4 animate-spin" />
            ) : (
              <Trash className="h-4 w-4" />
            )}
            {isDeleting
              ? t("detail.deleting")
              : t("detail.deletePermanently")}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
