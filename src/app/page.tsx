import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { FeaturesBento } from "@/components/landing/features-bento";
import { Marquee } from "@/components/landing/marquee";
import { ScrollShowcase } from "@/components/landing/scroll-showcase";
import { TestimonialCarousel } from "@/components/landing/testimonial-carousel";
import { CtaFooter } from "@/components/landing/cta-footer";

export default function Home() {
  return (
    <main className="w-full max-w-full overflow-x-hidden">
      <Navbar />
      <Hero />
      <FeaturesBento />
      <Marquee />
      <ScrollShowcase />
      <TestimonialCarousel />
      <CtaFooter />
    </main>
  );
}
