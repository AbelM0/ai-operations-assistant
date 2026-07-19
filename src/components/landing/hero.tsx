import { Button } from "@/components/ui/button";
import Link from "next/link";

export function Hero() {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-black px-6 py-32">
      <div
        className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-40"
        style={{
          backgroundImage:
            "url(https://picsum.photos/seed/ai-docs-dark/1920/1080)",
          filter: "grayscale(0.3) contrast(1.2) brightness(0.6)",
        }}
      />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,rgba(0,0,0,0.85)_100%)]" />

      <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center text-center">
        <h1 className="text-[clamp(2.5rem,5.5vw,5.5rem)] font-semibold leading-[1.05] tracking-tight text-white">
          Intelligent Document
          <br />
          Operations for{" "}
          <span className="inline-block align-middle">
            Ethiopian
          </span>{" "}
          SMEs
        </h1>

        <p className="mt-8 max-w-2xl text-lg leading-relaxed text-white/60 sm:text-xl">
          Upload invoices, receipts, and business documents. Ask
          questions in English or Amharic. Get instant AI-powered
          insights tailored for your business.
        </p>

        <div className="mt-12 flex flex-col gap-4 sm:flex-row">
          <Link href="/signup">
            <Button
              size="lg"
              className="h-12 rounded-xl bg-white px-8 text-base font-medium text-black hover:bg-white/90"
            >
              Get Started Free
            </Button>
          </Link>
          <a href="#features">
            <Button
              variant="outline"
              size="lg"
              className="h-12 rounded-xl border-white/15 bg-transparent px-8 text-base font-medium text-white hover:bg-white/10"
            >
              See How It Works
            </Button>
          </a>
        </div>
      </div>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="h-10 w-5 rounded-full border-2 border-white/20">
          <div className="mx-auto mt-2 h-1.5 w-0.5 rounded-full bg-white/40" />
        </div>
      </div>
    </section>
  );
}
