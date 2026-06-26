import { Suspense } from "react";
import { BillingSuccessContent } from "@/components/billing/success-content";

export const dynamic = "force-dynamic";

export default function BillingSuccessPage() {
  return (
    <Suspense fallback={<div className="py-16 text-center">Loading...</div>}>
      <BillingSuccessContent />
    </Suspense>
  );
}
