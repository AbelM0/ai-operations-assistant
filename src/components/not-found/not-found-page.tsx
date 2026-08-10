"use client";

import { ArrowLeft } from "@phosphor-icons/react";
import {
  motion,
  MotionConfig,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { LanguageToggle } from "@/components/language-toggle";

const fragments = [
  { left: "8%", top: "17%", size: 11, opacity: 0.44, depth: "far" },
  { left: "16%", top: "70%", size: 8, opacity: 0.32, depth: "near" },
  { left: "22%", top: "26%", size: 18, opacity: 0.58, depth: "near" },
  { left: "29%", top: "82%", size: 12, opacity: 0.42, depth: "far" },
  { left: "36%", top: "14%", size: 8, opacity: 0.3, depth: "far" },
  { left: "42%", top: "30%", size: 13, opacity: 0.48, depth: "near" },
  { left: "48%", top: "88%", size: 9, opacity: 0.5, depth: "near" },
  { left: "55%", top: "21%", size: 15, opacity: 0.38, depth: "far" },
  { left: "62%", top: "74%", size: 12, opacity: 0.52, depth: "near" },
  { left: "68%", top: "12%", size: 8, opacity: 0.34, depth: "near" },
  { left: "73%", top: "35%", size: 17, opacity: 0.42, depth: "far" },
  { left: "79%", top: "86%", size: 10, opacity: 0.46, depth: "near" },
  { left: "86%", top: "24%", size: 12, opacity: 0.58, depth: "near" },
  { left: "91%", top: "66%", size: 8, opacity: 0.38, depth: "far" },
] as const;

function FragmentField() {
  const reduceMotion = useReducedMotion();
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const springX = useSpring(pointerX, { stiffness: 70, damping: 22 });
  const springY = useSpring(pointerY, { stiffness: 70, damping: 22 });
  const nearX = useTransform(springX, [-1, 1], [-18, 18]);
  const nearY = useTransform(springY, [-1, 1], [-14, 14]);
  const farX = useTransform(springX, [-1, 1], [8, -8]);
  const farY = useTransform(springY, [-1, 1], [6, -6]);

  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 overflow-hidden"
      onPointerMove={(event) => {
        if (reduceMotion) return;
        const bounds = event.currentTarget.getBoundingClientRect();
        pointerX.set(((event.clientX - bounds.left) / bounds.width) * 2 - 1);
        pointerY.set(((event.clientY - bounds.top) / bounds.height) * 2 - 1);
      }}
      onPointerLeave={() => {
        pointerX.set(0);
        pointerY.set(0);
      }}
    >
      <div className="nexus-grid absolute inset-0 opacity-35" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_46%,rgba(45,212,191,0.12),transparent_32%)]" />

      {(["far", "near"] as const).map((depth) => (
        <motion.div
          key={depth}
          className="absolute inset-0"
          style={
            reduceMotion
              ? undefined
              : depth === "near"
                ? { x: nearX, y: nearY }
                : { x: farX, y: farY }
          }
        >
          {fragments
            .filter((fragment) => fragment.depth === depth)
            .map((fragment, index) => (
              <motion.span
                key={`${depth}-${fragment.left}-${fragment.top}`}
                initial={reduceMotion ? false : { opacity: 0, scale: 0.35 }}
                animate={{ opacity: fragment.opacity, scale: 1 }}
                transition={{
                  duration: 0.7,
                  delay: 0.12 + index * 0.055,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="absolute rounded-[3px] border border-[#5EEAD4]/40 bg-[#2DD4BF] shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]"
                style={{
                  left: fragment.left,
                  top: fragment.top,
                  width: fragment.size,
                  height: fragment.size,
                }}
              />
            ))}
        </motion.div>
      ))}
    </div>
  );
}

export function NotFoundPage() {
  const { t } = useTranslation();
  const reduceMotion = useReducedMotion();

  return (
    <MotionConfig reducedMotion="user">
      <main className="nexus-page relative isolate min-h-[100dvh] overflow-hidden bg-[#050505] text-white">
        <FragmentField />

        <header className="absolute inset-x-0 top-0 z-20 mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-5 sm:px-8">
          <Link
            href="/"
            className="flex items-center gap-2.5 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#5EEAD4]"
            aria-label={t("nav.homeAria")}
          >
            <span className="h-2.5 w-2.5 rounded-full bg-[#2DD4BF]" />
            <span className="text-xs font-semibold tracking-[0.16em] text-white sm:text-sm sm:tracking-[0.18em]">
              NEXUS<span className="text-[#71717A]">/OPS</span>
            </span>
          </Link>
          <LanguageToggle />
        </header>

        <section className="relative z-10 mx-auto flex min-h-[100dvh] w-full max-w-5xl items-center justify-center px-5 py-28 text-center sm:px-8">
          <motion.div
            initial={reduceMotion ? false : "hidden"}
            animate="visible"
            variants={{
              hidden: { opacity: 0, y: 24 },
              visible: {
                opacity: 1,
                y: 0,
                transition: {
                  duration: 0.75,
                  ease: [0.22, 1, 0.36, 1],
                  staggerChildren: 0.08,
                },
              },
            }}
            className="flex max-w-3xl flex-col items-center"
          >
            <motion.p
              variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
              className="mb-5 font-mono text-[11px] font-semibold uppercase tracking-[0.24em] text-[#5EEAD4]"
            >
              404
            </motion.p>
            <motion.h1
              variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }}
              className="text-balance text-5xl font-semibold leading-[0.96] tracking-[-0.055em] text-[#F4F4F5] sm:text-7xl lg:text-[5.75rem]"
            >
              {t("notFound.title")}
            </motion.h1>
            <motion.p
              variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }}
              className="mt-6 max-w-lg text-pretty text-base leading-7 text-[#A1A1AA] sm:text-lg"
            >
              {t("notFound.description")}
            </motion.p>
            <motion.div
              variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
              className="mt-9"
              whileHover={reduceMotion ? undefined : { y: -2 }}
              whileTap={reduceMotion ? undefined : { scale: 0.97 }}
            >
              <Link
                href="/"
                className="inline-flex min-h-11 items-center gap-2 whitespace-nowrap rounded-lg bg-[#2DD4BF] px-5 py-3 text-sm font-semibold text-[#04100E] transition-colors hover:bg-[#5EEAD4] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#5EEAD4]"
              >
                <ArrowLeft className="h-4 w-4" weight="bold" />
                {t("notFound.home")}
              </Link>
            </motion.div>
          </motion.div>
        </section>
      </main>
    </MotionConfig>
  );
}
