"use client";

import { motion } from "motion/react";
import {
  ChatText,
  CheckCircle,
  FileText,
  Scan,
  Sparkle,
} from "@phosphor-icons/react";
import { useTranslation } from "react-i18next";

const steps = [
  { key: "upload", icon: Scan },
  { key: "review", icon: FileText },
  { key: "ask", icon: Sparkle },
  { key: "continue", icon: ChatText },
] as const;

const safeguards = ["isolated", "selected", "citations"] as const;

export function ConciseOverview() {
  const { t } = useTranslation();

  return (
    <section id="workflow" className="px-5 py-24 sm:px-8 md:py-32">
      <div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="lg:sticky lg:top-32 lg:self-start"
        >
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-[#5EEAD4]">
            {t("nav.workflow")}
          </p>
          <h2 className="mt-6 max-w-xl text-balance text-[clamp(2.5rem,4.8vw,4.75rem)] font-medium leading-[0.98] tracking-[-0.045em] text-white">
            {t("landing.features.workflowTitle")}
          </h2>
          <p className="mt-6 max-w-md text-pretty text-base leading-7 text-[#A1A1AA]">
            {t("landing.features.workflowBody")}
          </p>
        </motion.div>

        <div className="border-t border-white/10">
          {steps.map(({ key, icon: Icon }, index) => (
            <motion.article
              key={key}
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.45 }}
              transition={{
                duration: 0.65,
                delay: index * 0.06,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="grid gap-4 border-b border-white/10 py-7 sm:grid-cols-[3rem_1fr_1.15fr] sm:items-start sm:gap-6 sm:py-8"
            >
              <div className="flex items-center justify-between sm:block">
                <span className="font-mono text-[10px] tracking-[0.14em] text-[#52525B]">
                  0{index + 1}
                </span>
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#2DD4BF]/10 text-[#5EEAD4] sm:mt-4">
                  <Icon className="h-4 w-4" />
                </span>
              </div>
              <h3 className="text-xl font-medium tracking-[-0.02em] text-white">
                {t(`landing.features.${key}.title`)}
              </h3>
              <div>
                <p className="text-sm leading-6 text-[#D4D4D8]">
                  {t(`landing.features.${key}.description`)}
                </p>
                <p className="mt-2 text-sm leading-6 text-[#71717A]">
                  {t(`landing.features.${key}.detail`)}
                </p>
              </div>
            </motion.article>
          ))}

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.65 }}
            className="mt-8 grid gap-3 rounded-xl border border-[#2DD4BF]/15 bg-[#0B1211] p-5 sm:grid-cols-3 sm:p-6"
          >
            {safeguards.map((key) => (
              <div key={key} className="flex items-center gap-3 text-sm text-[#D4D4D8]">
                <CheckCircle className="h-4 w-4 shrink-0 text-[#5EEAD4]" weight="fill" />
                <span>{t(`landing.features.safeguards.${key}`)}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
