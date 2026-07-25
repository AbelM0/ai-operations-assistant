"use client";

import { useState } from "react";
import { motion, type Variants } from "motion/react";
import {
  ChatText,
  FileText,
  Scan,
  ShieldCheck,
  Sparkle,
} from "@phosphor-icons/react";
import { useTranslation } from "react-i18next";

const container: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.08 },
  },
};

const item: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.72, ease: [0.22, 1, 0.36, 1] },
  },
};

const workflowPanels = [
  {
    key: "upload",
    icon: Scan,
  },
  {
    key: "review",
    icon: FileText,
  },
  {
    key: "ask",
    icon: Sparkle,
  },
  {
    key: "continue",
    icon: ChatText,
  },
];

function SectionIntro() {
  const { t } = useTranslation();
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.45 }}
      transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
      className="mb-16 flex flex-col justify-between gap-8 md:mb-20 md:flex-row md:items-end"
    >
      <h2 className="max-w-3xl text-balance text-[clamp(2.5rem,5vw,5rem)] font-medium leading-[0.98] tracking-[-0.045em] text-white">
        {t("landing.features.headingLineOne")}
        <br />
        {t("landing.features.headingLineTwo")}
      </h2>
      <p className="max-w-sm text-pretty text-sm leading-6 text-[#A1A1AA] sm:text-base">
        {t("landing.features.intro")}
      </p>
    </motion.div>
  );
}

function UploadCard() {
  const { t } = useTranslation();
  return (
    <motion.article
      variants={item}
      whileHover={{ y: -7, borderColor: "rgba(45,212,191,0.28)" }}
      className="group relative overflow-hidden rounded-xl border border-white/8 bg-[#111113] p-6 sm:p-8 lg:col-span-7"
    >
      <div className="flex max-w-lg items-start gap-4">
        <span className="rounded-lg bg-[#2DD4BF]/10 p-3 text-[#5EEAD4]">
          <Scan className="h-5 w-5" />
        </span>
        <div>
          <h3 className="text-xl font-medium tracking-[-0.02em] text-white">
            {t("landing.features.searchableTitle")}
          </h3>
          <p className="mt-3 text-sm leading-6 text-[#A1A1AA]">
            {t("landing.features.searchableBody")}
          </p>
        </div>
      </div>
      <div className="mt-10 grid gap-2 sm:grid-cols-3">
        {["Receipt_008.jpg", "Invoice_391.pdf", "Policy_scan.png"].map((file, index) => (
          <motion.div
            key={file}
            whileHover={{ y: -4, backgroundColor: "rgba(45,212,191,0.08)" }}
            className="rounded-lg border border-white/8 bg-[#09090B] p-4"
          >
            <div className="flex items-center justify-between">
              <FileText className="h-4 w-4 text-[#5EEAD4]" />
              <span className="font-mono text-[9px] text-[#52525B]">0{index + 1}</span>
            </div>
            <p className="mt-5 truncate text-xs text-[#D4D4D8]">{file}</p>
            <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/5">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: "100%" }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.35 + index * 0.12 }}
                className="h-full bg-[#2DD4BF]/70"
              />
            </div>
          </motion.div>
        ))}
      </div>
    </motion.article>
  );
}

function SummaryCard() {
  const { t } = useTranslation();
  return (
    <motion.article
      variants={item}
      whileHover={{ y: -7, borderColor: "rgba(45,212,191,0.28)" }}
      className="relative overflow-hidden rounded-xl border border-white/8 bg-[#151517] p-6 sm:p-8 lg:col-span-5"
    >
      <FileText className="h-6 w-6 text-[#5EEAD4]" />
      <h3 className="mt-8 max-w-sm text-2xl font-medium leading-tight tracking-[-0.025em] text-white">
        {t("landing.features.summaryTitle")}
      </h3>
      <p className="mt-4 max-w-md text-sm leading-6 text-[#A1A1AA]">
        {t("landing.features.summaryBody")}
      </p>
      <div className="mt-10 space-y-3">
        <motion.div
          whileHover={{ x: 5 }}
          className="ml-auto w-[86%] rounded-lg rounded-br-sm bg-white p-3 text-xs text-[#09090B]"
        >
          {t("landing.features.summaryPrompt")}
        </motion.div>
        <motion.div
          whileHover={{ x: 5 }}
          className="w-[90%] rounded-lg rounded-bl-sm border border-[#2DD4BF]/20 bg-[#0B1513] p-3 text-sm text-[#D4D4D8]"
        >
          <strong className="font-medium text-white">
            {t("landing.features.mainTopics")}
          </strong>
          <br />
          {t("landing.features.mainTopicsResult")}
        </motion.div>
      </div>
    </motion.article>
  );
}

function ConversationCard() {
  const { t } = useTranslation();
  const conversations = [
    ["landing.features.conversations.contract", 3],
    ["landing.features.conversations.report", 1],
    ["landing.features.conversations.payment", 4],
  ] as const;
  return (
    <motion.article
      variants={item}
      whileHover={{ y: -7, borderColor: "rgba(45,212,191,0.28)" }}
      className="relative overflow-hidden rounded-xl border border-white/8 bg-[#151517] p-6 sm:p-8 lg:col-span-5"
    >
      <ChatText className="h-6 w-6 text-[#5EEAD4]" />
      <h3 className="mt-8 text-2xl font-medium tracking-[-0.025em] text-white">
        {t("landing.features.continueTitle")}
      </h3>
      <p className="mt-4 text-sm leading-6 text-[#A1A1AA]">
        {t("landing.features.continueBody")}
      </p>
      <div className="mt-9 rounded-lg border border-white/8 bg-[#09090B] p-5">
        <div className="space-y-2">
          {conversations.map(([titleKey, sourceCount], index) => (
            <motion.div
              key={titleKey}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
              className="flex items-center justify-between rounded-md bg-white/[0.035] px-3 py-2.5"
            >
              <span className="truncate text-xs text-[#D4D4D8]">
                {t(titleKey)}
              </span>
              <span className="ml-3 font-mono text-[9px] uppercase tracking-[0.1em] text-[#5E5E66]">
                {t("landing.features.sourceCount", { count: sourceCount })}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.article>
  );
}

function TrustCard() {
  const { t } = useTranslation();
  const safeguards = [
    "landing.features.safeguards.isolated",
    "landing.features.safeguards.selected",
    "landing.features.safeguards.citations",
  ];
  return (
    <motion.article
      variants={item}
      whileHover={{ y: -7, borderColor: "rgba(45,212,191,0.28)" }}
      className="relative overflow-hidden rounded-xl border border-white/8 bg-[#111113] p-6 sm:p-8 lg:col-span-7"
    >
      <div className="grid gap-10 sm:grid-cols-[1fr_0.9fr] sm:items-end">
        <div>
          <ShieldCheck className="h-6 w-6 text-[#5EEAD4]" />
          <h3 className="mt-8 text-2xl font-medium tracking-[-0.025em] text-white">
            {t("landing.features.verifyTitle")}
          </h3>
          <p className="mt-4 max-w-md text-sm leading-6 text-[#A1A1AA]">
            {t("landing.features.verifyBody")}
          </p>
        </div>
        <div className="space-y-2">
          {safeguards.map((labelKey) => (
            <motion.div
              key={labelKey}
              whileHover={{ x: 5, borderColor: "rgba(45,212,191,0.24)" }}
              className="flex items-center gap-3 rounded-lg border border-white/8 bg-[#09090B] px-4 py-3"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-[#2DD4BF]" />
              <span className="text-xs text-[#D4D4D8]">{t(labelKey)}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.article>
  );
}

function WorkflowAccordion() {
  const [active, setActive] = useState(0);
  const { t } = useTranslation();

  return (
    <div className="mt-28 md:mt-40">
      <motion.div
        initial={{ opacity: 0, y: 26 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.7 }}
        className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"
      >
        <h3 className="max-w-xl text-3xl font-medium tracking-[-0.03em] text-white sm:text-4xl">
          {t("landing.features.workflowTitle")}
        </h3>
        <p className="max-w-sm text-sm leading-6 text-[#71717A]">
          {t("landing.features.workflowBody")}
        </p>
      </motion.div>

      <div className="flex min-h-[470px] flex-col gap-2 lg:flex-row">
        {workflowPanels.map((panel, index) => {
          const Icon = panel.icon;
          const isActive = active === index;
          return (
            <motion.button
              key={panel.key}
              type="button"
              onHoverStart={() => setActive(index)}
              onFocus={() => setActive(index)}
              onClick={() => setActive(index)}
              animate={{ flex: isActive ? 3.1 : 1, backgroundColor: isActive ? "#151817" : "#0D0D0F" }}
              whileHover={{ borderColor: "rgba(45,212,191,0.32)" }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="relative min-h-56 overflow-hidden rounded-xl border border-white/8 p-6 text-left sm:p-8 lg:min-w-0"
            >
              <div className="flex h-full min-h-44 flex-col justify-between lg:min-h-[405px]">
                <div className="flex items-center justify-between gap-4">
                  <Icon className="h-5 w-5 shrink-0 text-[#5EEAD4]" />
                  <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-[#52525B]">
                    {t(`landing.features.${panel.key}.title`)}
                  </span>
                </div>
                <motion.div
                  animate={{ opacity: isActive ? 1 : 0.55, y: isActive ? 0 : 8 }}
                  transition={{ duration: 0.4 }}
                  className="max-w-md"
                >
                  <h4 className="text-2xl font-medium tracking-[-0.025em] text-white">
                    {t(`landing.features.${panel.key}.description`)}
                  </h4>
                  <motion.p
                    animate={{ opacity: isActive ? 1 : 0, height: isActive ? "auto" : 0, marginTop: isActive ? 16 : 0 }}
                    transition={{ duration: 0.42 }}
                    className="overflow-hidden text-sm leading-6 text-[#A1A1AA]"
                  >
                    {t(`landing.features.${panel.key}.detail`)}
                  </motion.p>
                </motion.div>
              </div>
              {isActive && (
                <motion.div
                  layoutId="workflow-glow"
                  className="pointer-events-none absolute inset-x-8 bottom-0 h-px bg-[#2DD4BF] shadow-[0_0_24px_rgba(45,212,191,0.8)]"
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

export function FeaturesBento() {
  return (
    <section id="features" className="relative px-5 py-32 sm:px-8 md:py-48">
      <div className="mx-auto max-w-7xl">
        <SectionIntro />
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.12 }}
          className="grid grid-flow-dense grid-cols-1 gap-3 lg:grid-cols-12"
        >
          <UploadCard />
          <SummaryCard />
          <ConversationCard />
          <TrustCard />
        </motion.div>
        <WorkflowAccordion />
      </div>
    </section>
  );
}
