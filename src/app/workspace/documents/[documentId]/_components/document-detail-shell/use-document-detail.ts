"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import type { WorkspaceDocumentDetail } from "@/lib/documents/types";
import {
  fetchDocumentDetail,
  removeDocument,
  restartDocumentProcessing,
} from "./actions";
import type { RetryDocumentResponse } from "./types";
import { processingStatuses } from "./utils";

export function useDocumentDetail(
  initialDocument: WorkspaceDocumentDetail,
) {
  const { t } = useTranslation();
  const router = useRouter();
  const [document, setDocument] = useState(initialDocument);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!processingStatuses.includes(document.status)) return;

    let cancelled = false;
    const refresh = async () => {
      try {
        const refreshedDocument = await fetchDocumentDetail(document.id);
        if (!cancelled) setDocument(refreshedDocument);
      } catch {
        // Preserve the current detail and retry on the next interval.
      }
    };
    const interval = window.setInterval(() => void refresh(), 2500);
    void refresh();

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [document.id, document.status]);

  const retry = async () => {
    setIsRetrying(true);
    try {
      const payload = await restartDocumentProcessing(document.id);
      setDocument((current) => ({
        ...current,
        status: payload.document?.status || "UPLOADED",
        errorMessage: payload.document?.errorMessage ?? null,
      }));
      toast.success(
        payload.document?.status === "READY"
          ? t("detail.documentReady")
          : t("detail.processingRestarted"),
      );
    } catch (cause) {
      const failedDocument = (
        cause as Error & {
          document?: RetryDocumentResponse["document"];
        }
      ).document;
      if (failedDocument) {
        setDocument((current) => ({ ...current, ...failedDocument }));
      }
      toast.error(t("detail.processingRestartFailed"), {
        description:
          cause instanceof Error ? cause.message : t("detail.tryAgain"),
      });
    } finally {
      setIsRetrying(false);
    }
  };

  const deleteDocument = async () => {
    setIsDeleting(true);
    try {
      await removeDocument(document.id);
      toast.success(t("detail.documentDeleted"));
      router.push("/workspace/documents");
      router.refresh();
    } catch (cause) {
      toast.error(t("detail.documentDeleteFailed"), {
        description:
          cause instanceof Error ? cause.message : t("detail.tryAgain"),
      });
      setIsDeleting(false);
    }
  };

  return {
    document,
    mobileNavOpen,
    isRetrying,
    deleteOpen,
    isDeleting,
    setDocument,
    setMobileNavOpen,
    setDeleteOpen,
    retry,
    deleteDocument,
  };
}

export type DocumentDetailController = ReturnType<typeof useDocumentDetail>;
