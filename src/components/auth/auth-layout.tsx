import Link from "next/link";
import { Waves } from "@/components/effects/waves";

const benefits = [
  "Search every invoice, receipt, and business record",
  "Ask questions naturally in English or Amharic",
  "Trace each answer back to the original source",
];

export function AuthLayout({
  children,
  mode,
}: {
  children: React.ReactNode;
  mode: "sign-in" | "sign-up";
}) {
  const isSignUp = mode === "sign-up";

  return (
    <main className="relative grid min-h-dvh overflow-hidden bg-[#050505] text-white lg:grid-cols-[1.08fr_0.92fr]">
      <div className="nexus-grid pointer-events-none absolute inset-0 opacity-35" />
      <div className="pointer-events-none absolute left-[12%] top-[8%] h-80 w-80 rounded-full bg-[#2DD4BF]/10 blur-[120px]" />

      <section className="relative hidden min-h-dvh overflow-hidden border-r border-white/8 lg:flex lg:flex-col lg:justify-between lg:px-10 lg:py-9 xl:px-16 xl:py-12">
        <Waves
          lineColor="rgba(94, 234, 212, 0.34)"
          waveSpeedX={0.025}
          waveSpeedY={0.025}
          waveAmpX={30}
          waveAmpY={20}
          friction={0.92}
          tension={0.008}
          maxCursorMove={72}
          xGap={17}
          yGap={46}
          className="opacity-90"
        />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(5,5,5,0.12),rgba(5,5,5,0.62)),radial-gradient(circle_at_28%_42%,rgba(5,5,5,0.12),rgba(5,5,5,0.7)_72%)]" />

        <Link
          href="/"
          className="relative z-10 flex w-fit items-center gap-3"
          aria-label="Back to Nexus Ops home"
        >
          <span className="h-2.5 w-2.5 rounded-full bg-[#2DD4BF] shadow-[0_0_18px_rgba(45,212,191,0.7)]" />
          <span className="text-sm font-semibold tracking-[0.18em] text-white">
            NEXUS<span className="text-[#71717A]">/OPS</span>
          </span>
        </Link>

        <div className="relative z-10 max-w-2xl py-16">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.24em] text-[#5EEAD4]">
            {isSignUp
              ? "Your operational memory starts here"
              : "Your workspace is ready"}
          </p>
          <h1 className="mt-7 max-w-xl text-balance text-[clamp(3.4rem,5.2vw,6.2rem)] font-medium leading-[0.92] tracking-[-0.055em] text-white">
            {isSignUp
              ? "Give every document a purpose."
              : "Return to complete clarity."}
          </h1>
          <p className="mt-7 max-w-lg text-pretty text-base leading-7 text-[#A1A1AA]">
            {isSignUp
              ? "Create a secure workspace where scattered business files become clear, useful decisions."
              : "Log in to continue working with your documents, answers, and operational insights."}
          </p>

          <div className="mt-12 max-w-xl overflow-hidden rounded-xl border border-white/9 bg-[#0B0B0D]/90 shadow-[0_28px_80px_rgba(0,0,0,0.35)]">
            <div className="flex items-center justify-between border-b border-white/8 px-5 py-4">
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#2DD4BF]" />
                <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#71717A]">
                  Workspace readiness
                </span>
              </div>
              <span className="font-mono text-[9px] text-[#52525B]">
                SECURE
              </span>
            </div>
            <div className="grid grid-cols-[1fr_0.8fr]">
              <div className="space-y-3 border-r border-white/8 p-5">
                {benefits.map((benefit) => (
                  <div key={benefit} className="flex items-start gap-3">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#2DD4BF]" />
                    <p className="text-xs leading-5 text-[#D4D4D8]">
                      {benefit}
                    </p>
                  </div>
                ))}
              </div>
              <div className="flex flex-col justify-between p-5">
                <div>
                  <p className="font-mono text-[9px] uppercase tracking-[0.15em] text-[#52525B]">
                    Document signal
                  </p>
                  <p className="mt-2 text-2xl font-medium tracking-[-0.04em] text-white">
                    Clear
                  </p>
                </div>
                <div
                  className="mt-8 flex h-16 items-end gap-1.5"
                  aria-hidden="true"
                >
                  {[30, 48, 38, 64, 52, 78, 68, 92].map((height) => (
                    <span
                      key={height}
                      className="w-full rounded-sm bg-[#2DD4BF]/65"
                      style={{ height: `${height}%` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.15em] text-[#52525B]">
          <span>© {new Date().getFullYear()} Nexus Ops</span>
          <span>English / አማርኛ</span>
        </div>
      </section>

      <section className="relative flex min-h-dvh flex-col px-5 py-5 sm:px-8 sm:py-8 lg:px-12 xl:px-20">
        <div className="flex items-center justify-between lg:justify-end">
          <Link
            href="/"
            className="flex items-center gap-2.5 lg:hidden"
            aria-label="Back to Nexus Ops home"
          >
            <span className="h-2 w-2 rounded-full bg-[#2DD4BF]" />
            <span className="text-xs font-semibold tracking-[0.16em] text-white">
              NEXUS<span className="text-[#71717A]">/OPS</span>
            </span>
          </Link>
          <p className="text-xs text-[#71717A]">
            {isSignUp ? "Already have a workspace?" : "New to Nexus Ops?"}{" "}
            <Link
              href={isSignUp ? "/sign-in" : "/sign-up"}
              className="ml-1 font-semibold text-[#D4D4D8] underline decoration-[#2DD4BF]/50 underline-offset-4"
            >
              {isSignUp ? "Log in" : "Create one"}
            </Link>
          </p>
        </div>

        <div className="flex flex-1 items-center justify-center py-10 sm:py-14">
          <div className="w-full max-w-[30rem]">{children}</div>
        </div>

        <div className="flex items-center justify-center gap-5 font-mono text-[9px] uppercase tracking-[0.14em] text-[#52525B]">
          <span>Privacy</span>
          <span className="h-1 w-1 rounded-full bg-[#27272A]" />
          <span>Terms</span>
        </div>
      </section>
    </main>
  );
}
