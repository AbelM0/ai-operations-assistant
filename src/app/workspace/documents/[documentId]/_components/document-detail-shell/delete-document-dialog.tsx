"use client";

import { useTranslation } from "react-i18next";
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog";

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
    <DeleteConfirmationDialog
      open={open}
      isDeleting={isDeleting}
      title={t("detail.deleteTitle")}
      description={t("detail.deleteDescription")}
      cancelLabel={t("common.cancel")}
      confirmLabel={t("detail.deletePermanently")}
      deletingLabel={t("detail.deleting")}
      onOpenChange={onOpenChange}
      onConfirm={onDelete}
    />
  );
}
