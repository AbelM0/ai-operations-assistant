"use client";

import { FilePdf } from "@phosphor-icons/react";
import { useTranslation } from "react-i18next";
import type { WorkspaceDocumentDetail } from "@/lib/documents/types";

export function DocumentPreview({
  document,
}: {
  document: WorkspaceDocumentDetail;
}) {
  const { t } = useTranslation();

  return (
    <section
      aria-labelledby="preview-heading"
      className="overflow-hidden rounded-xl border border-white/10 bg-[#0B0B0D]"
    >
      <div className="flex items-center justify-between border-b border-white/8 px-5 py-4 sm:px-6">
        <div>
          <h2
            id="preview-heading"
            className="text-sm font-semibold text-white"
          >
            {t("detail.previewTitle")}
          </h2>
          <p className="mt-1 text-xs text-[#71717A]">
            {t("detail.previewDescription")}
          </p>
        </div>
        <FilePdf
          className="h-5 w-5 text-[#5EEAD4]"
          weight="duotone"
        />
      </div>
      <iframe
        src={`/api/documents/${document.id}/file`}
        title={t("detail.previewAria", { name: document.originalName })}
        className="h-[72dvh] min-h-[34rem] w-full bg-[#17171A]"
      />
    </section>
  );
}
