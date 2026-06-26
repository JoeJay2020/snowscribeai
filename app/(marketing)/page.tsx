import { Hero } from "@/components/home/hero";
import { FlagshipTools } from "@/components/home/flagship-tools";
import { Features } from "@/components/home/features";
import { PricingPreview } from "@/components/home/pricing-preview";
import { CTA } from "@/components/home/cta";

export default function HomePage() {
  return (
    <>
      <Hero />
      <FlagshipTools />
      <Features />
      <PricingPreview />
      <CTA />
    </>
  );
}
