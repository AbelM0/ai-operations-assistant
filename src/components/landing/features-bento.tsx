"use client";

import { useState } from "react";
import { motion, type Variants } from "motion/react";
import {
  ChartBar,
  ChatText,
  FileText,
  Scan,
  ShieldCheck,
  Translate,
} from "@phosphor-icons/react";

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
    title: "Capture",
    description: "Upload scans, photos, PDFs, and spreadsheets in one secure stream.",
    icon: Scan,
    detail: "OCR cleans and structures every file automatically.",
  },
  {
    title: "Understand",
    description: "Ask direct questions across every file your team has uploaded.",
    icon: ChatText,
    detail: "Every answer links back to its supporting source.",
  },
  {
    title: "Organize",
    description: "Extract vendors, dates, totals, categories, and recurring costs.",
    icon: FileText,
    detail: "Consistent records without repetitive data entry.",
  },
  {
    title: "Decide",
    description: "Turn activity into summaries your team can use immediately.",
    icon: ChartBar,
    detail: "See exceptions and trends before they become surprises.",
  },
];

function SectionIntro() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.45 }}
      transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
      className="mb-16 flex flex-col justify-between gap-8 md:mb-20 md:flex-row md:items-end"
    >
      <h2 className="max-w-3xl text-balance text-[clamp(2.5rem,5vw,5rem)] font-medium leading-[0.98] tracking-[-0.045em] text-white">
        Less document work.
        <br />
        More operational clarity.
      </h2>
      <p className="max-w-sm text-pretty text-sm leading-6 text-[#A1A1AA] sm:text-base">
        One workspace connects document intake, bilingual AI, financial extraction,
        and source-backed answers.
      </p>
    </motion.div>
  );
}

function UploadCard() {
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
          <h3 className="text-xl font-medium tracking-[-0.02em] text-white">Every file becomes usable data</h3>
          <p className="mt-3 text-sm leading-6 text-[#A1A1AA]">
            Clean OCR and structured extraction turn receipts, invoices, and scans
            into records your whole team can search.
          </p>
        </div>
      </div>
      <div className="mt-10 grid gap-2 sm:grid-cols-3">
        {["Receipt_008.jpg", "Invoice_391.pdf", "Stock_log.xlsx"].map((file, index) => (
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

function LanguageCard() {
  return (
    <motion.article
      variants={item}
      whileHover={{ y: -7, borderColor: "rgba(45,212,191,0.28)" }}
      className="relative overflow-hidden rounded-xl border border-white/8 bg-[#151517] p-6 sm:p-8 lg:col-span-5"
    >
      <Translate className="h-6 w-6 text-[#5EEAD4]" />
      <h3 className="mt-8 max-w-sm text-2xl font-medium leading-tight tracking-[-0.025em] text-white">
        Work naturally in English and Amharic.
      </h3>
      <p className="mt-4 max-w-md text-sm leading-6 text-[#A1A1AA]">
        Ask in either language. Nexus understands context, not just keywords.
      </p>
      <div className="mt-10 space-y-3">
        <motion.div
          whileHover={{ x: 5 }}
          className="ml-auto w-[86%] rounded-lg rounded-br-sm bg-white p-3 text-xs text-[#09090B]"
        >
          Show me all unpaid supplier invoices.
        </motion.div>
        <motion.div
          whileHover={{ x: 5 }}
          className="w-[90%] rounded-lg rounded-bl-sm border border-[#2DD4BF]/20 bg-[#0B1513] p-3 text-sm text-[#D4D4D8]"
        >
          ያልተከፈሉ 6 የአቅራቢ ደረሰኞች አግኝቻለሁ።
        </motion.div>
      </div>
    </motion.article>
  );
}

function InsightCard() {
  const bars = [42, 58, 51, 76, 62, 88, 73, 96];
  return (
    <motion.article
      variants={item}
      whileHover={{ y: -7, borderColor: "rgba(45,212,191,0.28)" }}
      className="relative overflow-hidden rounded-xl border border-white/8 bg-[#151517] p-6 sm:p-8 lg:col-span-5"
    >
      <ChartBar className="h-6 w-6 text-[#5EEAD4]" />
      <h3 className="mt-8 text-2xl font-medium tracking-[-0.025em] text-white">Know what changed, and why.</h3>
      <p className="mt-4 text-sm leading-6 text-[#A1A1AA]">
        Automatic summaries surface cost shifts, vendor trends, and unusual activity.
      </p>
      <div className="mt-9 rounded-lg border border-white/8 bg-[#09090B] p-5">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#71717A]">Operating spend</span>
          <span className="text-xs text-[#5EEAD4]">+12.8%</span>
        </div>
        <div className="mt-6 flex h-24 items-end gap-2">
          {bars.map((height, index) => (
            <motion.span
              key={index}
              initial={{ height: 0 }}
              whileInView={{ height: `${height}%` }}
              viewport={{ once: true }}
              transition={{ delay: 0.12 + index * 0.06, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              className="w-full rounded-sm bg-[#2DD4BF]/65"
            />
          ))}
        </div>
      </div>
    </motion.article>
  );
}

function TrustCard() {
  return (
    <motion.article
      variants={item}
      whileHover={{ y: -7, borderColor: "rgba(45,212,191,0.28)" }}
      className="relative overflow-hidden rounded-xl border border-white/8 bg-[#111113] p-6 sm:p-8 lg:col-span-7"
    >
      <div className="grid gap-10 sm:grid-cols-[1fr_0.9fr] sm:items-end">
        <div>
          <ShieldCheck className="h-6 w-6 text-[#5EEAD4]" />
          <h3 className="mt-8 text-2xl font-medium tracking-[-0.025em] text-white">Answers you can verify.</h3>
          <p className="mt-4 max-w-md text-sm leading-6 text-[#A1A1AA]">
            Every response stays grounded in your workspace and keeps the source
            document close at hand.
          </p>
        </div>
        <div className="space-y-2">
          {["Encrypted storage", "Workspace isolation", "Source citations"].map((label) => (
            <motion.div
              key={label}
              whileHover={{ x: 5, borderColor: "rgba(45,212,191,0.24)" }}
              className="flex items-center gap-3 rounded-lg border border-white/8 bg-[#09090B] px-4 py-3"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-[#2DD4BF]" />
              <span className="text-xs text-[#D4D4D8]">{label}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.article>
  );
}

function WorkflowAccordion() {
  const [active, setActive] = useState(0);

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
          One connected workflow.
        </h3>
        <p className="max-w-sm text-sm leading-6 text-[#71717A]">
          From raw file to informed action without switching tools.
        </p>
      </motion.div>

      <div className="flex min-h-[470px] flex-col gap-2 lg:flex-row">
        {workflowPanels.map((panel, index) => {
          const Icon = panel.icon;
          const isActive = active === index;
          return (
            <motion.button
              key={panel.title}
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
                    {panel.title}
                  </span>
                </div>
                <motion.div
                  animate={{ opacity: isActive ? 1 : 0.55, y: isActive ? 0 : 8 }}
                  transition={{ duration: 0.4 }}
                  className="max-w-md"
                >
                  <h4 className="text-2xl font-medium tracking-[-0.025em] text-white">
                    {panel.description}
                  </h4>
                  <motion.p
                    animate={{ opacity: isActive ? 1 : 0, height: isActive ? "auto" : 0, marginTop: isActive ? 16 : 0 }}
                    transition={{ duration: 0.42 }}
                    className="overflow-hidden text-sm leading-6 text-[#A1A1AA]"
                  >
                    {panel.detail}
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
          <LanguageCard />
          <InsightCard />
          <TrustCard />
        </motion.div>
        <WorkflowAccordion />
      </div>
    </section>
  );
}
