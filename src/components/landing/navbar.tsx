"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 inset-x-0 z-50 flex justify-center px-4 pt-4 transition-all duration-500 ${
        scrolled ? "pt-2" : "pt-6"
      }`}
    >
      <div
        className={`flex w-full max-w-5xl items-center justify-between rounded-2xl border border-white/10 px-5 py-2.5 backdrop-blur-xl transition-all duration-500 ${
          scrolled
            ? "bg-black/40 shadow-lg shadow-black/20"
            : "bg-black/20"
        }`}
      >
        <Link href="/" className="text-lg font-semibold tracking-tight text-white">
          AI<span className="text-white/60">Ops</span>
        </Link>

        <div className="hidden items-center gap-6 text-sm font-medium text-white/70 sm:flex">
          <a href="#features" className="transition-colors hover:text-white">
            Features
          </a>
          <a href="#how-it-works" className="transition-colors hover:text-white">
            How It Works
          </a>
          <a href="#testimonials" className="transition-colors hover:text-white">
            Trust
          </a>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm font-medium text-white/70 transition-colors hover:text-white"
          >
            Log In
          </Link>
          <Link href="/signup">
            <Button
              size="sm"
              className="rounded-xl bg-white text-black hover:bg-white/90"
            >
              Sign Up
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
