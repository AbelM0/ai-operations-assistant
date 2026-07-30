"use client";

import { useEffect, useRef, useState } from "react";
import type { TFunction } from "i18next";
import { toast } from "sonner";
import type { WorkspaceDocument } from "@/lib/documents/types";
import { getWorkspaceDocuments } from "../../actions";

const processingStatuses = [
  "OCR_PROCESSING",
  "OCR_COMPLETED",
  "CHUNKING",
  "EMBEDDING",
];

export function useDocumentPolling(
  initialDocuments: WorkspaceDocument[],
  translate: TFunction,
) {
  const [documents, setDocuments] = useState(initialDocuments);
  const [queuedDocumentIds, setQueuedDocumentIds] = useState<Set<string>>(
    () => new Set(),
  );
  const statusesRef = useRef(
    new Map(initialDocuments.map((document) => [document.id, document.status])),
  );
  const hasProcessingDocuments = documents.some(
    (document) =>
      processingStatuses.includes(document.status) ||
      queuedDocumentIds.has(document.id),
  );

  useEffect(() => {
    if (!hasProcessingDocuments) return;

    let cancelled = false;

    const refreshDocuments = async () => {
      try {
        const refreshedDocuments = await getWorkspaceDocuments();
        if (cancelled) return;

        const completedDocumentIds: string[] = [];

        for (const document of refreshedDocuments) {
          const previousStatus = statusesRef.current.get(document.id);

          if (["READY", "FAILED"].includes(document.status)) {
            completedDocumentIds.push(document.id);
          }

          if (previousStatus && previousStatus !== document.status) {
            if (document.status === "READY") {
              toast.success(translate("documents.readyToast"), {
                description: translate("documents.readyToastDescription", {
                  name: document.originalName,
                }),
              });
            } else if (document.status === "FAILED") {
              toast.error(translate("documents.failedToast"), {
                description:
                  document.errorMessage ||
                  translate("documents.failedToastDescription", {
                    name: document.originalName,
                  }),
              });
            }
          }
        }

        statusesRef.current = new Map(
          refreshedDocuments.map((document) => [
            document.id,
            document.status,
          ]),
        );
        if (completedDocumentIds.length > 0) {
          setQueuedDocumentIds((current) => {
            const next = new Set(current);
            completedDocumentIds.forEach((documentId) =>
              next.delete(documentId),
            );
            return next;
          });
        }
        setDocuments(refreshedDocuments);
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
  }, [hasProcessingDocuments, translate]);

  const addDocument = (document: WorkspaceDocument) => {
    setQueuedDocumentIds((current) => new Set(current).add(document.id));
    statusesRef.current.set(document.id, document.status);
    setDocuments((current) => [document, ...current]);
  };

  return { documents, addDocument };
}
