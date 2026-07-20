"use client";

import { motion } from "motion/react";
import { ArrowRight } from "@phosphor-icons/react";
import Link from "next/link";

const footerLinks = ["Privacy", "Terms", "Contact"];

export function CtaFooter() {
  return (
    <footer className="px-5 pb-6 pt-24 sm:px-8 md:pt-36">
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.25 }}
        transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
        className="relative mx-auto max-w-7xl overflow-hidden rounded-xl border border-[#2DD4BF]/20 bg-[#2DD4BF] px-6 py-24 text-[#04100E] sm:px-12 md:py-32 lg:px-20"
      >
        <motion.div
          animate={{ rotate: [0, 8, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
          className="pointer-events-none absolute -right-20 -top-24 h-80 w-80 rounded-full border border-[#04100E]/10"
        />
        <div className="relative z-10 flex flex-col justify-between gap-12 lg:flex-row lg:items-end">
          <div>
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-[#0F766E]">
              Your next clear decision starts here
            </p>
            <h2 className="mt-8 max-w-4xl text-balance text-[clamp(3rem,6.2vw,6.5rem)] font-medium leading-[0.92] tracking-[-0.055em]">
              Put your business knowledge to work.
            </h2>
          </div>
          <div className="shrink-0">
            <motion.div
              whileHover={{ y: -5, boxShadow: "0 20px 48px rgba(4,16,14,0.24)" }}
              whileTap={{ scale: 0.97 }}
            >
              <Link
                href="/sign-up"
                className="flex h-14 items-center justify-center gap-3 rounded-lg bg-[#050505] px-7 text-sm font-semibold text-white"
              >
                Start your free workspace
                <ArrowRight className="h-4 w-4" />
              </Link>
            </motion.div>
            <p className="mt-4 text-center text-xs text-[#0F766E]">No credit card required</p>
          </div>
        </div>
      </motion.section>

      <div className="mx-auto mt-6 flex max-w-7xl flex-col items-center justify-between gap-6 rounded-xl border border-white/8 bg-[#0B0B0D] px-6 py-7 text-xs text-[#71717A] sm:flex-row">
        <div className="flex items-center gap-3">
          <span className="h-2 w-2 rounded-full bg-[#2DD4BF]" />
          <span className="font-semibold tracking-[0.15em] text-[#D4D4D8]">NEXUS/OPS</span>
          <span>© {new Date().getFullYear()}</span>
        </div>
        <div className="flex items-center gap-6">
          {footerLinks.map((link) => (
            <motion.a
              key={link}
              href="#"
              whileHover={{ y: -2, color: "#FFFFFF" }}
              className="text-[#71717A]"
            >
              {link}
            </motion.a>
          ))}
          <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.96 }}>
            <Link href="/sign-in" className="font-medium text-[#D4D4D8]">
              Log in
            </Link>
          </motion.div>
        </div>
      </div>
    </footer>
  );
}
