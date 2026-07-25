"use client";

import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { am, en } from "@/messages";

export const supportedLanguages = ["en", "am"] as const;
export type AppLanguage = (typeof supportedLanguages)[number];
export const LANGUAGE_STORAGE_KEY = "nexusops-language";

export function applyDocumentLanguage(language: AppLanguage) {
  document.documentElement.lang = language;
  document.documentElement.dataset.language = language;
}

if (!i18n.isInitialized) {
  void i18n.use(initReactI18next).init({
    resources: {
      en: { translation: en },
      am: { translation: am },
    },
    lng: "en",
    fallbackLng: "en",
    supportedLngs: supportedLanguages,
    interpolation: { escapeValue: false },
    initAsync: false,
    returnNull: false,
  });
}

export default i18n;
