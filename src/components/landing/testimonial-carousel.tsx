"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, ArrowRight } from "@phosphor-icons/react";

const testimonials = [
  {
    quote:
      "Nexus replaced hours of receipt entry with a conversation. Our finance review is faster, and the whole team can finally find the same answer.",
    name: "Tigist Haile",
    role: "Owner, Addis Print Solutions",
    initials: "TH",
  },
  {
    quote:
      "The source links matter. We can move quickly without guessing where an answer came from, and our accountant gets cleaner records every month.",
    name: "Dawit Kebede",
    role: "Finance Manager, Mekelle Trading",
    initials: "DK",
  },
  {
    quote:
      "English and Amharic in one workspace changed adoption for us. Nexus feels less like another system and more like a teammate who knows our files.",
    name: "Meron Tadesse",
    role: "Operations Lead, Bahir Dar Logistics",
    initials: "MT",
  },
];

export function TestimonialCarousel() {
  const [active, setActive] = useState(0);
  const [direction, setDirection] = useState(1);

  const changeSlide = useCallback((nextIndex: number, nextDirection: number) => {
    setDirection(nextDirection);
    setActive((nextIndex + testimonials.length) % testimonials.length);
  }, []);

  const next = useCallback(() => {
    setDirection(1);
    setActive((current) => (current + 1) % testimonials.length);
  }, []);

  useEffect(() => {
    const timer = window.setInterval(next, 7000);
    return () => window.clearInterval(timer);
  }, [next]);

  const testimonial = testimonials[active];

  return (
    <section id="customers" className="px-5 py-32 sm:px-8 md:py-48">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
          className="overflow-hidden rounded-xl border border-white/9 bg-[#111113]"
        >
          <div className="grid min-h-[620px] lg:grid-cols-[0.62fr_1.38fr]">
            <div className="flex flex-col justify-between border-b border-white/8 p-7 sm:p-10 lg:border-b-0 lg:border-r lg:p-12">
              <div>
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-[#5EEAD4]">
                  Built for real operators
                </p>
                <h2 className="mt-7 text-4xl font-medium leading-[1] tracking-[-0.04em] text-white sm:text-5xl">
                  Clarity your team can feel.
                </h2>
              </div>
              <div className="mt-16 flex items-center gap-3">
                <motion.button
                  type="button"
                  onClick={() => changeSlide(active - 1, -1)}
                  whileHover={{ y: -3, borderColor: "rgba(45,212,191,0.4)", color: "#5EEAD4" }}
                  whileTap={{ scale: 0.94 }}
                  className="flex h-11 w-11 items-center justify-center rounded-lg border border-white/10 text-[#A1A1AA]"
                  aria-label="Previous testimonial"
                >
                  <ArrowLeft className="h-4 w-4" />
                </motion.button>
                <motion.button
                  type="button"
                  onClick={() => changeSlide(active + 1, 1)}
                  whileHover={{ y: -3, borderColor: "rgba(45,212,191,0.4)", color: "#5EEAD4" }}
                  whileTap={{ scale: 0.94 }}
                  className="flex h-11 w-11 items-center justify-center rounded-lg border border-white/10 text-[#A1A1AA]"
                  aria-label="Next testimonial"
                >
                  <ArrowRight className="h-4 w-4" />
                </motion.button>
                <span className="ml-2 font-mono text-[10px] tracking-[0.16em] text-[#52525B]">
                  0{active + 1} / 0{testimonials.length}
                </span>
              </div>
            </div>

            <div className="relative flex min-h-[430px] items-center overflow-hidden p-7 sm:p-12 lg:p-16">
              <div className="pointer-events-none absolute right-0 top-0 h-72 w-72 rounded-full bg-[#2DD4BF]/8 blur-[100px]" />
              <AnimatePresence mode="wait" custom={direction}>
                <motion.figure
                  key={active}
                  custom={direction}
                  initial={{ opacity: 0, x: direction * 46 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: direction * -46 }}
                  transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                  className="relative z-10"
                >
                  <blockquote className="max-w-4xl text-balance text-[clamp(1.9rem,3.5vw,3.7rem)] font-medium leading-[1.12] tracking-[-0.035em] text-white">
                    “{testimonial.quote}”
                  </blockquote>
                  <figcaption className="mt-12 flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#2DD4BF]/25 bg-[#2DD4BF]/10 text-sm font-semibold text-[#5EEAD4]">
                      {testimonial.initials}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{testimonial.name}</p>
                      <p className="mt-1 font-mono text-[10px] text-[#71717A]">{testimonial.role}</p>
                    </div>
                  </figcaption>
                </motion.figure>
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
