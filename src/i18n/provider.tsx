"use client";

import { useEffect, type ReactNode } from "react";
import { I18nextProvider } from "react-i18next";
import i18n, {
  applyDocumentLanguage,
  LANGUAGE_STORAGE_KEY,
  type AppLanguage,
} from "@/i18n/config";

export function I18nProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    const saved = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    const language: AppLanguage =
      saved === "am" || saved === "en"
        ? saved
        : navigator.language.toLowerCase().startsWith("am")
          ? "am"
          : "en";

    void i18n.changeLanguage(language);
    applyDocumentLanguage(language);
  }, []);

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
