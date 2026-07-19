"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const steps = [
  {
    number: "01",
    title: "Upload your documents",
    description:
      "Drag invoices, receipts, or PDFs onto the dashboard. Our OCR engine processes scanned documents and handwritten notes with high accuracy.",
    image: "https://picsum.photos/seed/upload-step/800/500",
  },
  {
    number: "02",
    title: "Ask anything",
    description:
      "Type questions in English or Amharic. The AI understands context across all your uploaded documents and delivers precise answers in seconds.",
    image: "https://picsum.photos/seed/chat-step/800/500",
  },
  {
    number: "03",
    title: "Get insights, not just data",
    description:
      "Automatic expense summaries, vendor breakdowns, and spending trends. Export reports your accountant will actually understand.",
    image: "https://picsum.photos/seed/insights-step/800/500",
  },
];

export function ScrollShowcase() {
  const containerRef = useRef<HTMLElement>(null);
  const imagesRef = useRef<(HTMLDivElement | null)[]>([]);

  useGSAP(
    () => {
      if (!containerRef.current) return;

      const sections = gsap.utils.toArray<HTMLElement>(
        containerRef.current!.querySelectorAll(".scale-fade-card")
      );

      sections.forEach((el) => {
        gsap.fromTo(
          el,
          { scale: 0.85, opacity: 0.3, filter: "brightness(0.5)" },
          {
            scale: 1,
            opacity: 1,
            filter: "brightness(1)",
            duration: 1.2,
            ease: "power2.out",
            scrollTrigger: {
              trigger: el,
              start: "top 85%",
              end: "top 30%",
              scrub: 1.2,
            },
          }
        );
      });
    },
    { scope: containerRef }
  );

  return (
    <section
      id="how-it-works"
      ref={containerRef}
      className="bg-black px-6 py-32 md:py-48"
    >
      <div className="mx-auto max-w-6xl">
        <div className="grid items-start gap-16 lg:grid-cols-2 lg:gap-24">
          <div className="lg:sticky lg:top-32">
            <h2 className="text-[clamp(2rem,4vw,3.5rem)] font-semibold leading-[1.1] tracking-tight text-white">
              How it
              <br />
              works
            </h2>
            <p className="mt-4 max-w-sm text-lg text-white/50">
              Three steps from document chaos to complete clarity.
            </p>
          </div>

          <div className="flex flex-col gap-32">
            {steps.map((step, i) => (
              <div
                key={step.number}
                ref={(el) => { imagesRef.current[i] = el; }}
                className="scale-fade-card"
              >
                <div className="mb-4 text-sm font-medium tracking-widest text-white/25">
                  {step.number}
                </div>
                <h3 className="text-2xl font-semibold tracking-tight text-white">
                  {step.title}
                </h3>
                <p className="mt-3 max-w-md leading-relaxed text-white/50">
                  {step.description}
                </p>
                <div className="mt-8 overflow-hidden rounded-2xl border border-white/5">
                  <img
                    src={step.image}
                    alt=""
                    className="w-full object-cover"
                    style={{
                      filter: "grayscale(0.3) contrast(1.15)",
                      aspectRatio: "16/8",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
