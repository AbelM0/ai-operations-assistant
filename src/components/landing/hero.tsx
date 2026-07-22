"use client";

import { motion, type Variants } from "motion/react";
import {
  ArrowRight,
  FileText,
  MagnifyingGlass,
  Sparkle,
} from "@phosphor-icons/react";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { Aurora } from "@/components/effects/aurora";

const reveal: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] },
  }),
};

const documents = [
  ["Invoice_1048.pdf", "Processed"],
  ["Q2_receipts.zip", "12 files"],
  ["Supplier_contract.pdf", "Indexed"],
];

export function Hero() {
  const { isSignedIn } = useAuth();

  return (
    <section className="relative isolate flex min-h-[980px] items-center overflow-hidden px-5 pb-28 pt-40 sm:px-8 lg:min-h-[1060px] lg:pb-40 lg:pt-48">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[48rem] overflow-hidden opacity-75 [mask-image:linear-gradient(to_bottom,black_0%,black_44%,transparent_92%)]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_12%,rgba(45,212,191,0.16),transparent_58%)]" />
        <Aurora
          colorStops={["#134E4A", "#5EEAD4", "#0F766E"]}
          blend={0.68}
          amplitude={0.82}
          speed={0.55}
          className="relative opacity-70 mix-blend-screen"
        />
      </div>
      <div className="nexus-grid pointer-events-none absolute inset-0 opacity-40" />

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col items-center text-center">
        <motion.p
          variants={reveal}
          initial="hidden"
          animate="visible"
          custom={0.12}
          className="mb-7 font-mono text-[11px] font-semibold uppercase tracking-[0.26em] text-[#5EEAD4]"
        >
          Business intelligence for teams that move
        </motion.p>

        <motion.h1
          variants={reveal}
          initial="hidden"
          animate="visible"
          custom={0.2}
          className="max-w-6xl text-balance text-[clamp(2.7rem,7.1vw,7.2rem)] font-medium leading-[0.94] tracking-[-0.055em] text-white"
        >
          Turn documents{" "}
          <motion.span
            aria-hidden="true"
            animate={{ backgroundPosition: ["18% 50%", "82% 50%", "18% 50%"] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
            className="mx-[0.08em] inline-block h-[0.56em] w-[1.18em] rounded-full border border-white/15 bg-cover align-[0.02em] grayscale"
            style={{
              backgroundImage:
                "linear-gradient(rgba(45,212,191,0.14),rgba(45,212,191,0.14)),url(https://picsum.photos/seed/nexus-operations/480/240)",
            }}
          />{" "}
          into clear decisions.
        </motion.h1>

        <motion.p
          variants={reveal}
          initial="hidden"
          animate="visible"
          custom={0.3}
          className="mt-8 max-w-2xl text-pretty text-base leading-7 text-[#A1A1AA] sm:text-lg"
        >
          Nexus reads invoices, receipts, and business records, then gives your
          team trusted answers, expense insights, and instant summaries in
          English or Amharic.
        </motion.p>

        <motion.div
          variants={reveal}
          initial="hidden"
          animate="visible"
          custom={0.4}
          className="mt-10 flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row"
        >
          <motion.div
            whileHover={{
              y: -4,
              boxShadow: "0 18px 60px rgba(45,212,191,0.24)",
            }}
            whileTap={{ scale: 0.97 }}
            className="w-full sm:w-auto"
          >
            <Link
              href={isSignedIn ? "/workspace" : "/sign-up"}
              className="flex h-13 w-full items-center justify-center gap-2 rounded-lg bg-[#2DD4BF] px-7 text-sm font-semibold text-[#04100E] sm:w-auto"
            >
              {isSignedIn ? "Open your workspace" : "Create your workspace"}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
          <motion.a
            href="#features"
            whileHover={{
              y: -4,
              borderColor: "rgba(94,234,212,0.45)",
              backgroundColor: "rgba(24,24,27,0.8)",
            }}
            whileTap={{ scale: 0.97 }}
            className="flex h-13 w-full items-center justify-center rounded-lg border border-[#27272A] bg-[#0B0B0D]/70 px-7 text-sm font-semibold text-white sm:w-auto"
          >
            Explore capabilities
          </motion.a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 70, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1.05, delay: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="relative mt-20 w-full max-w-6xl text-left sm:mt-24"
        >
          <div className="absolute -inset-8 -z-10 rounded-[3rem] bg-[#2DD4BF]/7 blur-3xl" />
          <div className="overflow-hidden rounded-xl border border-white/10 bg-[#0A0A0C] shadow-[0_40px_120px_rgba(0,0,0,0.65)]">
            <div className="flex h-12 items-center justify-between border-b border-white/8 px-4 sm:px-6">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#2DD4BF]" />
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#71717A]">
                  Nexus workspace
                </span>
              </div>
              <div className="hidden items-center gap-4 font-mono text-[10px] text-[#52525B] sm:flex">
                <span>EN / አማ</span>
                <span>SECURE SESSION</span>
              </div>
            </div>

            <div className="grid min-h-[430px] lg:grid-cols-[0.72fr_1.28fr]">
              <div className="border-b border-white/8 p-5 sm:p-7 lg:border-b-0 lg:border-r">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-white">
                    Document stream
                  </p>
                  <motion.button
                    whileHover={{
                      scale: 1.05,
                      backgroundColor: "rgba(45,212,191,0.14)",
                    }}
                    whileTap={{ scale: 0.95 }}
                    className="rounded-md border border-[#2DD4BF]/25 p-2 text-[#5EEAD4]"
                    aria-label="Add document"
                  >
                    <FileText className="h-4 w-4" />
                  </motion.button>
                </div>
                <div className="mt-6 space-y-2">
                  {documents.map(([name, state], index) => (
                    <motion.div
                      key={name}
                      initial={{ opacity: 0, x: -18 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.9 + index * 0.12, duration: 0.55 }}
                      whileHover={{
                        x: 5,
                        borderColor: "rgba(45,212,191,0.25)",
                      }}
                      className="flex items-center justify-between rounded-lg border border-white/7 bg-[#111113] p-3.5"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <FileText className="h-4 w-4 shrink-0 text-[#5EEAD4]" />
                        <span className="truncate text-xs text-[#D4D4D8]">
                          {name}
                        </span>
                      </div>
                      <span className="ml-3 font-mono text-[9px] uppercase tracking-[0.12em] text-[#71717A]">
                        {state}
                      </span>
                    </motion.div>
                  ))}
                </div>
                <div className="mt-8 rounded-lg border border-dashed border-[#2DD4BF]/20 bg-[#2DD4BF]/[0.03] p-5 text-center">
                  <p className="text-xs text-[#A1A1AA]">
                    Drop business files here
                  </p>
                  <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.14em] text-[#52525B]">
                    PDF, image, spreadsheet
                  </p>
                </div>
              </div>

              <div className="relative flex flex-col p-5 sm:p-7 lg:p-9">
                <div className="flex items-center gap-3 border-b border-white/8 pb-5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#2DD4BF]/10 text-[#5EEAD4]">
                    <Sparkle className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">
                      Operations analyst
                    </p>
                    <p className="mt-0.5 text-xs text-[#71717A]">
                      Grounded in 148 workspace documents
                    </p>
                  </div>
                </div>

                <div className="flex flex-1 flex-col justify-center py-9">
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.15, duration: 0.55 }}
                    className="ml-auto max-w-[88%] rounded-xl rounded-br-sm bg-white px-4 py-3 text-sm leading-6 text-[#09090B]"
                  >
                    Which supplier costs increased the most this quarter?
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.45, duration: 0.6 }}
                    className="mt-4 max-w-[92%] rounded-xl rounded-bl-sm border border-[#2DD4BF]/15 bg-[#101817] px-4 py-4"
                  >
                    <p className="text-sm leading-6 text-[#D4D4D8]">
                      Packaging costs from Abeba Supply rose 18.4%, driven by
                      three higher-volume orders in May.
                    </p>
                    <div
                      className="mt-4 flex items-end gap-1.5"
                      aria-hidden="true"
                    >
                      {[34, 48, 44, 68, 58, 82, 76, 100].map(
                        (height, index) => (
                          <motion.span
                            key={index}
                            initial={{ height: 0 }}
                            animate={{ height }}
                            transition={{
                              delay: 1.6 + index * 0.05,
                              duration: 0.45,
                            }}
                            className="w-full max-w-8 rounded-sm bg-[#2DD4BF]/70"
                            style={{ height: `${height * 0.38}px` }}
                          />
                        ),
                      )}
                    </div>
                  </motion.div>
                </div>

                <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-[#0D0D0F] px-4 py-3 text-[#71717A]">
                  <MagnifyingGlass className="h-4 w-4" />
                  <span className="text-xs">
                    Ask about cash flow, vendors, or any document…
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
