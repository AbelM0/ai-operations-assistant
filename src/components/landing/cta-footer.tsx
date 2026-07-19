import { Button } from "@/components/ui/button";
import Link from "next/link";

export function CtaFooter() {
  return (
    <footer className="bg-zinc-950">
      <section className="border-t border-white/5 px-6 py-32 md:py-40">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-[clamp(2rem,4.5vw,4rem)] font-semibold leading-[1.1] tracking-tight text-white">
            Start managing your
            <br />
            business documents today
          </h2>
          <p className="mt-6 text-lg text-white/50">
            Free to start. No credit card required. Upgrade when you need more.
          </p>
          <div className="mt-10">
            <Link href="/signup">
              <Button
                size="lg"
                className="h-14 rounded-2xl bg-white px-10 text-base font-medium text-black hover:bg-white/90"
              >
                Create Free Account
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <div className="border-t border-white/5 px-6 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-sm text-white/30 sm:flex-row">
          <div className="flex items-center gap-2">
            <span className="font-medium text-white/50">AIOps</span>
            <span>&copy; {new Date().getFullYear()}</span>
          </div>
          <div className="flex gap-6">
            <a href="#" className="transition-colors hover:text-white/60">
              Privacy
            </a>
            <a href="#" className="transition-colors hover:text-white/60">
              Terms
            </a>
            <a href="#" className="transition-colors hover:text-white/60">
              Contact
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
