"use client";

import {
  SpinnerGap,
  Trash,
  WarningCircle,
} from "@phosphor-icons/react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type DeleteConfirmationDialogProps = {
  open: boolean;
  isDeleting: boolean;
  title: string;
  description: string;
  cancelLabel: string;
  confirmLabel: string;
  deletingLabel: string;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
};

export function DeleteConfirmationDialog({
  open,
  isDeleting,
  title,
  description,
  cancelLabel,
  confirmLabel,
  deletingLabel,
  onOpenChange,
  onConfirm,
}: DeleteConfirmationDialogProps) {
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
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription className="mt-1 leading-6 text-[#A1A1AA]">
              {description}
            </DialogDescription>
          </DialogHeader>
        </div>
        <DialogFooter className="border-t border-white/8 bg-[#08080A] px-6 py-4">
          <button
            type="button"
            disabled={isDeleting}
            onClick={() => onOpenChange(false)}
            className="h-10 rounded-lg border border-white/10 px-4 text-sm text-[#D4D4D8] transition-colors hover:border-white/20 hover:bg-white/5 hover:text-white disabled:opacity-60"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            disabled={isDeleting}
            onClick={onConfirm}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-red-500 px-4 text-sm font-semibold text-white transition-colors hover:bg-red-400 active:translate-y-px disabled:opacity-60"
          >
            {isDeleting ? (
              <SpinnerGap className="h-4 w-4 animate-spin" />
            ) : (
              <Trash className="h-4 w-4" />
            )}
            {isDeleting ? deletingLabel : confirmLabel}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
