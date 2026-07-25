"use client";

import {
  ChatCenteredDots,
  CheckCircle,
  FileText,
  Quotes,
} from "@phosphor-icons/react";
import { motion } from "motion/react";
import { useTranslation } from "react-i18next";

const capabilities = [
  {
    number: "01",
    key: "visible",
    icon: FileText,
  },
  {
    number: "02",
    key: "progress",
    icon: CheckCircle,
  },
  {
    number: "03",
    key: "context",
    icon: ChatCenteredDots,
  },
];

export function ProductProof() {
  const { t } = useTranslation();
  return (
    <section id="product" className="px-5 py-32 sm:px-8 md:py-48">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
          className="grid gap-12 lg:grid-cols-[0.76fr_1.24fr] lg:items-end"
        >
          <div>
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-[#5EEAD4]">
              {t("landing.proof.eyebrow")}
            </p>
            <h2 className="mt-6 max-w-xl text-balance text-[clamp(2.7rem,5vw,5.2rem)] font-medium leading-[0.98] tracking-[-0.05em] text-white">
              {t("landing.proof.title")}
            </h2>
          </div>
          <p className="max-w-xl text-pretty text-base leading-7 text-[#A1A1AA]">
            {t("landing.proof.intro")}
          </p>
        </motion.div>

        <div className="mt-16 grid gap-3 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="space-y-3">
            {capabilities.map(({ number, key, icon: Icon }, index) => (
              <motion.article
                key={key}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{
                  delay: index * 0.1,
                  duration: 0.55,
                  ease: [0.22, 1, 0.36, 1],
                }}
                whileHover={{ x: 5, borderColor: "rgba(45,212,191,0.26)" }}
                className="grid grid-cols-[2.5rem_1fr_auto] gap-4 rounded-xl border border-white/8 bg-[#0D0D0F] p-5 sm:p-6"
              >
                <span className="font-mono text-[9px] text-[#52525B]">
                  {number}
                </span>
                <div>
                  <h3 className="text-base font-semibold tracking-[-0.02em] text-white">
                    {t(`landing.proof.${key}.title`)}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-[#71717A]">
                    {t(`landing.proof.${key}.body`)}
                  </p>
                </div>
                <Icon
                  className="h-5 w-5 shrink-0 text-[#5EEAD4]"
                  weight="duotone"
                />
              </motion.article>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 35 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{
              duration: 0.75,
              delay: 0.12,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="relative overflow-hidden rounded-xl border border-[#2DD4BF]/18 bg-[#0B1110] p-6 shadow-[0_28px_90px_rgba(0,0,0,0.35)] sm:p-8"
          >
            <div className="pointer-events-none absolute right-0 top-0 h-64 w-64 rounded-full bg-[#2DD4BF]/8 blur-[90px]" />
            <div className="relative">
              <div className="flex items-center justify-between border-b border-white/8 pb-5">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#2DD4BF]/10 text-[#5EEAD4]">
                    <Quotes className="h-4 w-4" weight="fill" />
                  </span>
                  <div>
                    <p className="text-sm font-medium text-white">
                      {t("landing.proof.response")}
                    </p>
                    <p className="mt-0.5 text-xs text-[#71717A]">
                      {t("landing.proof.retrievalSummary")}
                    </p>
                  </div>
                </div>
                <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#5EEAD4]">
                  {t("landing.proof.streaming")}
                </span>
              </div>

              <div className="py-10">
                <p className="max-w-2xl text-lg leading-8 text-[#E4E4E7]">
                  {t("landing.proof.sampleAnswer")}
                </p>
                <div className="mt-7 grid gap-2 sm:grid-cols-2">
                  {[
                    ["S1", t("landing.proof.policySource")],
                    ["S2", t("landing.proof.procedureSource")],
                  ].map(([source, detail]) => (
                    <div
                      key={source}
                      className="rounded-lg border border-white/8 bg-[#090D0C] p-4"
                    >
                      <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#5EEAD4]">
                        {source}
                      </p>
                      <p className="mt-2 text-xs text-[#8B8B95]">{detail}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="h-1 overflow-hidden rounded-full bg-white/7">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: "78%" }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.4, delay: 0.45 }}
                  className="h-full rounded-full bg-[#2DD4BF]"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
