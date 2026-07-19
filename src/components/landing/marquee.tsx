"use client";

import { useEffect, useRef } from "react";

const tags = [
  "PDF Parsing",
  "OCR Engine",
  "Expense Tracking",
  "AI-Powered Chat",
  "Amharic Support",
  "Secure Storage",
  "Real-Time Insights",
  "Vendor Analysis",
  "Drag & Drop",
  "Automatic Summaries",
  "Export Reports",
  "Bilingual AI",
];

export function Marquee() {
  const row1Ref = useRef<HTMLDivElement>(null);
  const row2Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const animate = (el: HTMLDivElement, speed: number) => {
      let pos = 0;
      const step = () => {
        pos -= speed;
        if (Math.abs(pos) >= el.scrollWidth / 2) pos = 0;
        el.style.transform = `translateX(${pos}px)`;
        requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };

    if (row1Ref.current) animate(row1Ref.current, 0.5);
    if (row2Ref.current) animate(row2Ref.current, -0.4);
  }, []);

  return (
    <section className="overflow-hidden border-y border-white/5 bg-zinc-950 py-10">
      <div className="mb-3 flex">
        <div ref={row1Ref} className="flex shrink-0 gap-6 whitespace-nowrap">
          {[...tags, ...tags].map((tag, i) => (
            <span
              key={`${tag}-${i}`}
              className="rounded-full border border-white/10 bg-white/[0.03] px-5 py-2 text-sm font-medium text-white/40"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
      <div className="flex">
        <div ref={row2Ref} className="flex shrink-0 gap-6 whitespace-nowrap">
          {[...tags.reverse(), ...tags.reverse()].map((tag, i) => (
            <span
              key={`${tag}-${i}`}
              className="rounded-full border border-white/10 bg-white/[0.03] px-5 py-2 text-sm font-medium text-white/40"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
