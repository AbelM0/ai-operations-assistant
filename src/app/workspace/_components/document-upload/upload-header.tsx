"use client";

import { CheckCircle } from "@phosphor-icons/react";
import { useTranslation } from "react-i18next";

export function UploadHeader() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-4 border-b border-white/8 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
      <div>
        <h2
          id="upload-heading"
          className="text-lg font-semibold tracking-[-0.025em] text-white"
        >
          {t("upload.addFirst")}
        </h2>
        <p className="mt-1 text-sm leading-6 text-[#8B8B95]">
          {t("upload.addFirstDescription")}
        </p>
      </div>
      <div className="flex items-center gap-2 self-start font-mono text-[10px] uppercase tracking-[0.14em] text-[#5EEAD4]">
        <CheckCircle className="h-4 w-4" weight="fill" />
        {t("common.privateWorkspace")}
      </div>
    </div>
  );
}
