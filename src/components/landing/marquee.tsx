"use client";

import { motion } from "motion/react";
import { useTranslation } from "react-i18next";

const tags = [
  "landing.marquee.ocr",
  "landing.marquee.selectedChat",
  "landing.marquee.groundedAnswers",
  "landing.marquee.history",
  "landing.marquee.retrieval",
  "landing.marquee.citations",
  "landing.marquee.summaries",
  "landing.marquee.streaming",
];

function MarqueeRow({ reverse = false }: { reverse?: boolean }) {
  const { t } = useTranslation();
  const items = reverse ? [...tags].reverse() : tags;
  return (
    <div className="flex overflow-hidden">
      <motion.div
        animate={{ x: reverse ? ["-50%", "0%"] : ["0%", "-50%"] }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        className="flex w-max shrink-0 gap-3 pr-3"
      >
        {[...items, ...items].map((tag, index) => (
          <span
            key={`${tag}-${index}`}
            className="whitespace-nowrap rounded-full border border-white/8 bg-[#111113] px-5 py-2.5 text-xs text-[#A1A1AA]"
          >
            {t(tag)}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

export function Marquee() {
  return (
    <section className="space-y-3 overflow-hidden border-y border-white/8 bg-[#08080A] py-8">
      <MarqueeRow />
      <MarqueeRow reverse />
    </section>
  );
}
