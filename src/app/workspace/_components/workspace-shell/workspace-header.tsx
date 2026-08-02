"use client";

import { useTranslation } from "react-i18next";
import { LanguageToggle } from "@/components/language-toggle";
import { SidebarTrigger } from "@/components/ui/sidebar";

export function WorkspaceHeader() {
  const { t } = useTranslation();

  return (
    <header className="sticky top-0 z-20 flex h-17 items-center justify-between border-b border-white/8 bg-[#050505]/88 px-4 backdrop-blur-xl sm:px-7 lg:px-10">
      <div className="flex items-center gap-3">
        <SidebarTrigger
          className="h-9 w-9 rounded-lg text-[#A1A1AA] hover:bg-white/5 hover:text-white focus-visible:ring-2 focus-visible:ring-[#5EEAD4]"
          aria-label={t("nav.openNavigation")}
        />
        <div>
          <p className="text-sm font-medium text-white">
            {t("nav.workspace")}
          </p>
          <p className="hidden text-xs text-[#71717A] sm:block">
            {t("workspace.privateLibrary")}
          </p>
        </div>
      </div>
      <LanguageToggle />
    </header>
  );
}
