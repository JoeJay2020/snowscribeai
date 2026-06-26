import { PricingCards } from "@/components/billing/pricing-cards";

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight">Pricing</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Affordable plans for students, researchers, and teams. Pay securely with Pesepay.
        </p>
      </div>

      <PricingCards />

      <p className="mt-8 text-center text-sm text-muted-foreground">
        All paid plans include monthly credit renewal. Payments processed via Pesepay.
      </p>
    </div>
  );
}
