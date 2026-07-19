"use client";

import { useState, useEffect, useCallback } from "react";

const testimonials = [
  {
    quote:
      "We used to spend hours manually entering receipts. Now we just upload and ask. The Amharic support is a game changer for our team.",
    name: "Tigist Haile",
    role: "Owner, Addis Print Solutions",
    avatar: "https://picsum.photos/seed/person1/100/100",
  },
  {
    quote:
      "The expense summaries alone save us two days every month. Our accountant loves the automatic categorization. Highly recommended.",
    name: "Dawit Kebede",
    role: "Finance Manager, Mekelle Trading",
    avatar: "https://picsum.photos/seed/person2/100/100",
  },
  {
    quote:
      "Being able to switch between English and Amharic means everyone on our team can use it. The AI actually understands context across documents.",
    name: "Meron Tadesse",
    role: "Operations Lead, Bahir Dar Logistics",
    avatar: "https://picsum.photos/seed/person3/100/100",
  },
];

export function TestimonialCarousel() {
  const [active, setActive] = useState(0);
  const count = testimonials.length;

  const next = useCallback(() => setActive((a) => (a + 1) % count), [count]);
  const prev = useCallback(
    () => setActive((a) => (a - 1 + count) % count),
    [count]
  );

  useEffect(() => {
    const t = setInterval(next, 6000);
    return () => clearInterval(t);
  }, [next]);

  const t = testimonials[active];

  return (
    <section id="testimonials" className="bg-black px-6 py-32 md:py-48">
      <div className="mx-auto max-w-4xl text-center">
        <h2 className="text-[clamp(2rem,4vw,3.5rem)] font-semibold leading-[1.1] tracking-tight text-white">
          Trusted by
          <br />
          Ethiopian businesses
        </h2>

        <div className="mt-20 transition-all duration-700">
          <p className="mx-auto max-w-2xl text-xl leading-relaxed text-white/70 sm:text-2xl">
            &ldquo;{t.quote}&rdquo;
          </p>

          <div className="mt-10 flex items-center justify-center gap-4">
            <img
              src={t.avatar}
              alt=""
              className="h-12 w-12 rounded-full object-cover ring-1 ring-white/10"
              style={{ filter: "grayscale(0.3)" }}
            />
            <div className="text-left">
              <div className="font-medium text-white">{t.name}</div>
              <div className="text-sm text-white/40">{t.role}</div>
            </div>
          </div>
        </div>

        <div className="mt-12 flex items-center justify-center gap-6">
          <button
            onClick={prev}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white/40 transition-colors hover:border-white/30 hover:text-white"
            aria-label="Previous testimonial"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="15 4 7 12 15 20" />
            </svg>
          </button>
          <div className="flex gap-2">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  i === active ? "w-8 bg-white/60" : "w-4 bg-white/15"
                }`}
                aria-label={`Testimonial ${i + 1}`}
              />
            ))}
          </div>
          <button
            onClick={next}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white/40 transition-colors hover:border-white/30 hover:text-white"
            aria-label="Next testimonial"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="9 4 17 12 9 20" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}
