"use client";

import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";
import {
  ChatCenteredDots,
  Clock,
  DownloadSimple,
  FileText,
} from "@phosphor-icons/react";

const story = [
  {
    title: "Prepare the source.",
    description:
      "Upload a PDF or image. Nexus extracts its text, keeps page context, and reports when the file is ready to use.",
    outcome: "A searchable document with visible status",
    icon: DownloadSimple,
    visual: "capture",
  },
  {
    title: "Review without the long wait.",
    description:
      "Open the document preview and request a structured summary. Progress appears immediately and the final response streams into view.",
    outcome: "A readable summary beside the source",
    icon: FileText,
    visual: "understand",
  },
  {
    title: "Ask, verify, and return.",
    description:
      "Choose the documents for each conversation, follow inline citations, and continue saved chats from the Ask Nexus history.",
    outcome: "Answers with continuity and evidence",
    icon: ChatCenteredDots,
    visual: "act",
  },
];

const statement =
  "Your documents should not disappear into storage. Nexus keeps them readable, searchable, and available for questions with evidence attached.";

function ScrubbedWord({
  word,
  index,
  total,
  progress,
}: {
  word: string;
  index: number;
  total: number;
  progress: MotionValue<number>;
}) {
  const start = index / total;
  const opacity = useTransform(progress, [start, Math.min(start + 0.16, 1)], [0.12, 1]);
  return (
    <motion.span style={{ opacity }} className="mr-[0.24em] inline-block">
      {word}
    </motion.span>
  );
}

function CaptureVisual() {
  return (
    <div className="grid h-full grid-cols-2 gap-2 p-4 sm:p-6">
      {["INVOICE", "RECEIPT", "CONTRACT", "LEDGER"].map((label, index) => (
        <motion.div
          key={label}
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.08, duration: 0.45 }}
          whileHover={{ y: -5, borderColor: "rgba(45,212,191,0.3)" }}
          className="flex min-h-28 flex-col justify-between rounded-lg border border-white/8 bg-[#0B0B0D] p-4"
        >
          <span className="font-mono text-[9px] tracking-[0.16em] text-[#71717A]">{label}</span>
          <div className="space-y-1.5">
            <span className="block h-1 w-full rounded-full bg-white/10" />
            <span className="block h-1 w-2/3 rounded-full bg-white/10" />
            <span className="block h-1 w-4/5 rounded-full bg-[#2DD4BF]/35" />
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function UnderstandVisual() {
  return (
    <div className="flex h-full flex-col justify-center gap-3 p-5 sm:p-8">
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        className="ml-auto max-w-[82%] rounded-lg rounded-br-sm bg-white p-3 text-xs leading-5 text-[#09090B]"
      >
        What notice period applies before termination?
      </motion.div>
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.16 }}
        className="max-w-[90%] rounded-lg rounded-bl-sm border border-[#2DD4BF]/20 bg-[#0C1715] p-4 text-xs leading-5 text-[#D4D4D8]"
      >
        The agreement requires 30 days&apos; written notice before termination,
        except where the breach provisions permit immediate action [S1].
        <div className="mt-3 flex gap-2 font-mono text-[8px] uppercase tracking-[0.12em] text-[#5EEAD4]">
          <span>S1 · page 9</span>
          <span>Selected source</span>
        </div>
      </motion.div>
    </div>
  );
}

function ActVisual() {
  return (
    <div className="flex h-full flex-col p-5 sm:p-8">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-mono text-[9px] uppercase tracking-[0.15em] text-[#71717A]">Ask Nexus history</p>
          <p className="mt-2 text-2xl font-medium tracking-[-0.04em] text-white">Continue the thread</p>
        </div>
        <Clock className="h-5 w-5 text-[#5EEAD4]" />
      </div>
      <div className="mt-8 space-y-2">
        {[
          ["Contract obligations", "3 selected sources"],
          ["Quarterly report topics", "2 selected sources"],
          ["Payment and renewal terms", "4 selected sources"],
        ].map(([title, detail], index) => (
          <motion.div
            key={title}
            initial={{ opacity: 0, x: -12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="rounded-lg border border-white/8 bg-[#0B0B0D] px-4 py-3"
          >
            <p className="text-xs font-medium text-[#D4D4D8]">{title}</p>
            <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.1em] text-[#52525B]">
              {detail}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function StoryCard({ entry, index }: { entry: (typeof story)[number]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 88%", "end 30%"] });
  const scale = useTransform(scrollYProgress, [0, 0.45, 1], [0.9, 1, 0.985]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 1], [0.25, 1, 0.72]);
  const Icon = entry.icon;

  return (
    <motion.article
      ref={ref}
      style={{ scale, opacity, top: 112 + index * 18 }}
      className="sticky mb-10 overflow-hidden rounded-xl border border-white/10 bg-[#111113] shadow-[0_32px_90px_rgba(0,0,0,0.42)]"
    >
      <div className="grid min-h-[560px] lg:grid-cols-[0.85fr_1.15fr]">
        <div className="flex flex-col justify-between border-b border-white/8 p-7 sm:p-10 lg:border-b-0 lg:border-r">
          <div className="flex items-center justify-between">
            <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#2DD4BF]/10 text-[#5EEAD4]">
              <Icon className="h-5 w-5" />
            </span>
            <span className="font-mono text-[10px] tracking-[0.18em] text-[#52525B]">0{index + 1}</span>
          </div>
          <div className="mt-16 lg:mt-24">
            <h3 className="max-w-md text-3xl font-medium leading-[1.03] tracking-[-0.035em] text-white sm:text-4xl">
              {entry.title}
            </h3>
            <p className="mt-5 max-w-md text-sm leading-6 text-[#A1A1AA]">{entry.description}</p>
            <div className="mt-8 flex items-center gap-3 border-t border-white/8 pt-5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#2DD4BF]" />
              <span className="text-xs font-medium text-[#D4D4D8]">{entry.outcome}</span>
            </div>
          </div>
        </div>
        <div className="min-h-[330px] bg-[radial-gradient(circle_at_50%_40%,rgba(45,212,191,0.09),transparent_55%)]">
          {entry.visual === "capture" && <CaptureVisual />}
          {entry.visual === "understand" && <UnderstandVisual />}
          {entry.visual === "act" && <ActVisual />}
        </div>
      </div>
    </motion.article>
  );
}

export function ScrollShowcase() {
  const statementRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: statementRef,
    offset: ["start 82%", "end 28%"],
  });
  const words = statement.split(" ");

  return (
    <section id="workflow" className="px-5 py-32 sm:px-8 md:py-48">
      <div ref={statementRef} className="mx-auto max-w-7xl py-12 md:py-24">
        <p className="max-w-6xl text-balance text-[clamp(2.35rem,5vw,5.4rem)] font-medium leading-[1.05] tracking-[-0.045em] text-white">
          {words.map((word, index) => (
            <ScrubbedWord
              key={`${word}-${index}`}
              word={word}
              index={index}
              total={words.length}
              progress={scrollYProgress}
            />
          ))}
        </p>
      </div>

      <div className="mx-auto mt-32 max-w-7xl md:mt-48">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.7 }}
          className="mb-16 flex flex-col justify-between gap-6 md:flex-row md:items-end"
        >
          <h2 className="max-w-3xl text-balance text-[clamp(2.5rem,5vw,5rem)] font-medium leading-[0.98] tracking-[-0.045em] text-white">
            From uploaded file to cited conversation.
          </h2>
          <p className="max-w-xs text-sm leading-6 text-[#71717A]">
            Three connected moments, with the source visible throughout.
          </p>
        </motion.div>

        <div className="relative pb-24">
          {story.map((entry, index) => (
            <StoryCard key={entry.title} entry={entry} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
