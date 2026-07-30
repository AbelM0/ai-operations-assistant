"use client";

import { useTranslation } from "react-i18next";
import { DocumentUpload } from "../../../_components/document-upload";
import type { WorkspaceDocument } from "@/lib/documents/types";

export function EmptyDocuments({
  onUploaded,
}: {
  onUploaded: (document: WorkspaceDocument) => void;
}) {
  const { t } = useTranslation();

  return (
    <>
      <section className="max-w-3xl">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-[#5EEAD4]">
          {t("documents.startLibrary")}
        </p>
        <h1 className="mt-4 text-balance text-[clamp(2.4rem,5vw,4.6rem)] font-medium leading-[0.98] tracking-[-0.05em] text-white">
          {t("documents.emptyTitle")}
        </h1>
        <p className="mt-5 max-w-xl text-base leading-7 text-[#A1A1AA] sm:text-lg">
          {t("documents.emptyDescription")}
        </p>
      </section>
      <div className="mt-10 max-w-4xl">
        <DocumentUpload onUploaded={onUploaded} />
      </div>
    </>
  );
}
