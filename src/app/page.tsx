"use client";

import { MotionConfig } from "motion/react";
import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { ConciseOverview } from "@/components/landing/concise-overview";
import { CtaFooter } from "@/components/landing/cta-footer";

export default function Home() {
  return (
    <MotionConfig reducedMotion="user">
      <div className="nexus-page w-full max-w-full overflow-x-hidden bg-[#050505] text-white">
        <Navbar />
        <main>
          <Hero />
          <ConciseOverview />
        </main>
        <CtaFooter />
      </div>
    </MotionConfig>
  );
}
