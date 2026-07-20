"use client";

import { MotionConfig } from "motion/react";
import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { FeaturesBento } from "@/components/landing/features-bento";
import { ScrollShowcase } from "@/components/landing/scroll-showcase";
import { TestimonialCarousel } from "@/components/landing/testimonial-carousel";
import { CtaFooter } from "@/components/landing/cta-footer";

export default function Home() {
  return (
    <MotionConfig reducedMotion="user">
      <main className="nexus-page w-full max-w-full overflow-x-hidden bg-[#050505] text-white">
        <Navbar />
        <Hero />
        <FeaturesBento />
        <ScrollShowcase />
        <TestimonialCarousel />
        <CtaFooter />
      </main>
    </MotionConfig>
  );
}
