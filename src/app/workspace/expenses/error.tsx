"use client";

import { WarningCircle } from "@phosphor-icons/react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

export default function ExpensesError({ reset }: { reset: () => void }) {
  const { t } = useTranslation();

  return (
    <main className="grid min-h-[70vh] place-items-center bg-[#08080A] p-6 text-white">
      <div className="max-w-md rounded-2xl border border-red-400/20 bg-[#101012] p-8 text-center">
        <WarningCircle className="mx-auto h-9 w-9 text-red-300" weight="duotone" />
        <h1 className="mt-5 text-xl font-semibold tracking-tight">
          {t("expenses.errorTitle")}
        </h1>
        <p className="mt-2 text-sm leading-6 text-[#8B8B95]">
          {t("expenses.errorDescription")}
        </p>
        <Button
          type="button"
          onClick={reset}
          className="mt-6 bg-[#2DD4BF] text-[#052F2B] hover:bg-[#5EEAD4]"
        >
          {t("expenses.retry")}
        </Button>
      </div>
    </main>
  );
}
