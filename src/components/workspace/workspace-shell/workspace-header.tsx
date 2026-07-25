"use client";

import { UserButton } from "@clerk/nextjs";
import { SidebarSimple } from "@phosphor-icons/react";
import { useTranslation } from "react-i18next";
import { LanguageToggle } from "@/components/language-toggle";

type WorkspaceHeaderProps = {
  onOpenNavigation: () => void;
};

export function WorkspaceHeader({
  onOpenNavigation,
}: WorkspaceHeaderProps) {
  const { t } = useTranslation();

  return (
    <header className="sticky top-0 z-20 flex h-17 items-center justify-between border-b border-white/8 bg-[#050505]/88 px-4 backdrop-blur-xl sm:px-7 lg:px-10">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenNavigation}
          className="rounded-lg p-2 text-[#A1A1AA] hover:bg-white/5 hover:text-white focus-visible:outline-2 focus-visible:outline-[#5EEAD4] lg:hidden"
          aria-label={t("nav.openNavigation")}
        >
          <SidebarSimple className="h-5 w-5" />
        </button>
        <div>
          <p className="text-sm font-medium text-white">
            {t("nav.workspace")}
          </p>
          <p className="hidden text-xs text-[#71717A] sm:block">
            {t("workspace.privateLibrary")}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <LanguageToggle />
        <UserButton
          appearance={{
            elements: {
              userButtonBox: "h-9 w-9 rounded-lg",
              avatarBox: "h-9 w-9 rounded-lg",
              userButtonTrigger:
                "focus:ring-2 focus:ring-[#5EEAD4] focus:ring-offset-2 focus:ring-offset-[#050505]",
            },
          }}
        />
      </div>
    </header>
  );
}
