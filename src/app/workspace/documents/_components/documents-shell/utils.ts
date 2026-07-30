import type { WorkspaceDocument } from "@/lib/documents/types";

export function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatDate(value: string, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(value));
}

export function getFileType(
  document: WorkspaceDocument,
  translate: (key: string) => string,
) {
  if (document.mimeType === "application/pdf") {
    return translate("documents.typePdf");
  }

  if (document.mimeType.startsWith("image/")) {
    return translate("documents.typeImage");
  }

  return translate("documents.typeDocument");
}
