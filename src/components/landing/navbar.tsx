"use client";

import { useEffect, useState } from "react";
import { UserButton, useAuth } from "@clerk/nextjs";
import { ArrowRight } from "@phosphor-icons/react";
import { motion } from "motion/react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { LanguageToggle } from "@/components/language-toggle";

const navLinks = [
  { href: "#workflow", label: "nav.workflow" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const { isSignedIn } = useAuth();
  const { t } = useTranslation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-x-0 top-0 z-50 flex justify-center px-3 sm:px-5"
      aria-label={t("nav.primary")}
    >
      <motion.div
        animate={{
          y: scrolled ? 8 : 20,
          backgroundColor: scrolled
            ? "rgba(5, 5, 5, 0.88)"
            : "rgba(5, 5, 5, 0.54)",
          borderColor: scrolled
            ? "rgba(45, 212, 191, 0.2)"
            : "rgba(255, 255, 255, 0.1)",
        }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="flex w-[calc(100vw-1.5rem)] min-w-0 max-w-7xl items-center justify-between rounded-xl border px-4 py-3 shadow-2xl shadow-black/20 backdrop-blur-2xl sm:w-full sm:px-5"
      >
        <Link href="/" className="flex shrink-0 items-center gap-2.5" aria-label={t("nav.homeAria")}>
          <motion.span
            animate={{ opacity: [0.45, 1, 0.45], scale: [0.9, 1, 0.9] }}
            transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
            className="h-2.5 w-2.5 rounded-full bg-[#2DD4BF] shadow-[0_0_18px_rgba(45,212,191,0.75)]"
          />
          <span className="text-xs font-semibold tracking-[0.16em] text-white sm:text-sm sm:tracking-[0.18em]">
            NEXUS<span className="text-[#71717A]">/OPS</span>
          </span>
        </Link>

        <div className="hidden items-center gap-7 lg:flex">
          {navLinks.map((item) => (
            <motion.a
              key={item.href}
              href={item.href}
              whileHover={{ y: -2, color: "#FFFFFF" }}
              transition={{ duration: 0.2 }}
              className="text-sm text-[#A1A1AA]"
            >
              {t(item.label)}
            </motion.a>
          ))}
        </div>

        <div className="flex shrink-0 items-center gap-1 sm:gap-3">
          <LanguageToggle />
          {isSignedIn ? (
            <>
              <Link
                href="/workspace"
                className="hidden items-center gap-2 rounded-lg bg-[#2DD4BF] px-4 py-2 text-sm font-semibold text-[#04100E] transition-colors hover:bg-[#5EEAD4] sm:flex"
              >
                {t("landing.openWorkspace")}
                <ArrowRight className="h-4 w-4" weight="bold" />
              </Link>
              <UserButton
                appearance={{
                  elements: {
                    userButtonBox: "h-9 w-9 rounded-lg",
                    userButtonTrigger: "focus:ring-0 focus:shadow-none",
                  },
                }}
              />
            </>
          ) : (
            <>
              <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.96 }}>
                <Link
                  href="/sign-in"
                  className="hidden rounded-lg px-3 py-2 text-sm font-medium text-[#D4D4D8] sm:block sm:px-4"
                >
                  {t("nav.login")}
                </Link>
              </motion.div>
              <motion.div
                whileHover={{ y: -2, boxShadow: "0 12px 36px rgba(45,212,191,0.22)" }}
                whileTap={{ scale: 0.96 }}
              >
                <Link
                  href="/sign-up"
                  className="block rounded-lg bg-[#2DD4BF] px-3 py-2 text-sm font-semibold text-[#04100E] sm:px-4"
                >
                  <span className="sm:hidden">{t("nav.start")}</span>
                  <span className="hidden sm:inline">{t("nav.startFree")}</span>
                </Link>
              </motion.div>
            </>
          )}
        </div>
      </motion.div>
    </motion.nav>
  );
}
