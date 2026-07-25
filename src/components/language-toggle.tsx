"use client";

import { Translate } from "@phosphor-icons/react";
import { useTranslation } from "react-i18next";
import {
  applyDocumentLanguage,
  LANGUAGE_STORAGE_KEY,
  type AppLanguage,
} from "@/i18n/config";

export function LanguageToggle({ compact = false }: { compact?: boolean }) {
  const { t, i18n } = useTranslation();
  const currentLanguage: AppLanguage =
    i18n.resolvedLanguage === "am" ? "am" : "en";

  const setLanguage = (language: AppLanguage) => {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    applyDocumentLanguage(language);
    void i18n.changeLanguage(language);
  };

  return (
    <div
      className="inline-flex h-9 items-center rounded-lg border border-white/10 bg-[#0B0B0D]/90 p-1 shadow-[0_10px_30px_rgba(0,0,0,0.2)]"
      role="group"
      aria-label={t("language.label")}
    >
      {!compact ? (
        <Translate
          className="mx-1.5 h-4 w-4 text-[#71717A]"
          aria-hidden="true"
        />
      ) : null}
      {(["en", "am"] as const).map((language) => (
        <button
          key={language}
          type="button"
          onClick={() => setLanguage(language)}
          aria-pressed={currentLanguage === language}
          lang={language}
          className={`h-7 rounded-md px-2.5 text-[11px] font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5EEAD4] ${
            currentLanguage === language
              ? "bg-[#2DD4BF] text-[#04100E]"
              : "text-[#A1A1AA] hover:bg-white/5 hover:text-white"
          }`}
        >
          {language === "en" ? "EN" : "አማ"}
        </button>
      ))}
    </div>
  );
}
