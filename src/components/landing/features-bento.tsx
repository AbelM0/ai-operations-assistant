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
    title: "Upload",
    description: "Add a PDF or scanned image to your private workspace.",
    icon: Scan,
    detail: "Nexus extracts text, preserves page context, and prepares the source for search.",
  },
  {
    title: "Review",
    description: "Preview the file and generate a readable document summary.",
    icon: FileText,
    detail: "Long documents are compressed in stages and the final summary streams as it is written.",
  },
  {
    title: "Ask",
    description: "Choose exactly which ready documents Nexus can use.",
    icon: Sparkle,
    detail: "Semantic and keyword retrieval find relevant passages before the answer begins.",
  },
  {
    title: "Continue",
    description: "Return to saved conversations without losing document context.",
    icon: ChatText,
    detail: "Add or remove sources during a chat and keep every response tied to citations.",
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
        More verifiable answers.
      </h2>
      <p className="max-w-sm text-pretty text-sm leading-6 text-[#A1A1AA] sm:text-base">
        One workspace connects document processing, streamed summaries,
        selected-source chat, citations, and conversation history.
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
          <h3 className="text-xl font-medium tracking-[-0.02em] text-white">Scanned files become searchable sources</h3>
          <p className="mt-3 text-sm leading-6 text-[#A1A1AA]">
            Nexus processes PDFs and images, tracks document status, and keeps
            page references available for retrieval.
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
  return (
    <motion.article
      variants={item}
      whileHover={{ y: -7, borderColor: "rgba(45,212,191,0.28)" }}
      className="relative overflow-hidden rounded-xl border border-white/8 bg-[#151517] p-6 sm:p-8 lg:col-span-5"
    >
      <FileText className="h-6 w-6 text-[#5EEAD4]" />
      <h3 className="mt-8 max-w-sm text-2xl font-medium leading-tight tracking-[-0.025em] text-white">
        Read the document without reading every page.
      </h3>
      <p className="mt-4 max-w-md text-sm leading-6 text-[#A1A1AA]">
        Generate a structured summary and watch it stream into the document
        view as the model writes.
      </p>
      <div className="mt-10 space-y-3">
        <motion.div
          whileHover={{ x: 5 }}
          className="ml-auto w-[86%] rounded-lg rounded-br-sm bg-white p-3 text-xs text-[#09090B]"
        >
          Summarize the main topics and obligations.
        </motion.div>
        <motion.div
          whileHover={{ x: 5 }}
          className="w-[90%] rounded-lg rounded-bl-sm border border-[#2DD4BF]/20 bg-[#0B1513] p-3 text-sm text-[#D4D4D8]"
        >
          <strong className="font-medium text-white">Main topics</strong>
          <br />
          Reporting duties, payment terms, and termination conditions…
        </motion.div>
      </div>
    </motion.article>
  );
}

function ConversationCard() {
  return (
    <motion.article
      variants={item}
      whileHover={{ y: -7, borderColor: "rgba(45,212,191,0.28)" }}
      className="relative overflow-hidden rounded-xl border border-white/8 bg-[#151517] p-6 sm:p-8 lg:col-span-5"
    >
      <ChatText className="h-6 w-6 text-[#5EEAD4]" />
      <h3 className="mt-8 text-2xl font-medium tracking-[-0.025em] text-white">Continue where the question left off.</h3>
      <p className="mt-4 text-sm leading-6 text-[#A1A1AA]">
        Saved conversation history keeps previous answers and source selections
        within reach.
      </p>
      <div className="mt-9 rounded-lg border border-white/8 bg-[#09090B] p-5">
        <div className="space-y-2">
          {[
            ["Contract obligations", "3 sources"],
            ["Q2 report summary", "1 source"],
            ["Supplier payment terms", "4 sources"],
          ].map(([title, sources], index) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
              className="flex items-center justify-between rounded-md bg-white/[0.035] px-3 py-2.5"
            >
              <span className="truncate text-xs text-[#D4D4D8]">{title}</span>
              <span className="ml-3 font-mono text-[9px] uppercase tracking-[0.1em] text-[#5E5E66]">
                {sources}
              </span>
            </motion.div>
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
          {["User-isolated retrieval", "Selected-source context", "Page-aware citations"].map((label) => (
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
          From raw file to a saved, source-grounded conversation.
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
          <SummaryCard />
          <ConversationCard />
          <TrustCard />
        </motion.div>
        <WorkflowAccordion />
      </div>
    </section>
  );
}
