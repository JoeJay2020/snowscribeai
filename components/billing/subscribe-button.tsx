"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { PLANS, type PlanId } from "@/lib/constants";
import { Button } from "@/components/ui/button";

const PAID_PLANS: PlanId[] = ["STUDENT", "PRO", "BUSINESS"];

interface SubscribeButtonProps {
  planId: PlanId;
  variant?: "default" | "outline";
  className?: string;
  children: React.ReactNode;
}

export function SubscribeButton({
  planId,
  variant = "default",
  className,
  children,
}: SubscribeButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!PAID_PLANS.includes(planId)) {
    return (
      <Button variant={variant} className={className} disabled>
        {children}
      </Button>
    );
  }

  const handleSubscribe = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/billing/pesepay/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          window.location.href = "/login?redirect=/pricing";
          return;
        }
        setError(data.error ?? "Payment failed");
        return;
      }

      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Button
        variant={variant}
        className={className}
        onClick={handleSubscribe}
        disabled={loading}
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            Processing...
          </>
        ) : (
          children
        )}
      </Button>
      {error && (
        <p className="mt-1 text-xs text-destructive text-center">{error}</p>
      )}
    </div>
  );
}

export function formatPlanPrice(planId: PlanId): string {
  const plan = PLANS[planId];
  if (plan.price === null) return "Custom";
  if (plan.price === 0) return "Free";
  return `$${plan.price}`;
}
