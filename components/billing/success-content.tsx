"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Loader2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function BillingSuccessContent() {
  const searchParams = useSearchParams();
  const reference = searchParams.get("reference") ?? searchParams.get("referenceNumber");
  const [status, setStatus] = useState<"loading" | "success" | "pending" | "error">("loading");
  const [planName, setPlanName] = useState("");

  useEffect(() => {
    if (!reference) {
      setStatus("success");
      return;
    }

    fetch("/api/billing/pesepay/webhook", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ referenceNumber: reference }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.paid || data.status === "completed") {
          setStatus("success");
          setPlanName(data.plan ?? "");
        } else if (data.status === "pending") {
          setStatus("pending");
        } else {
          setStatus("error");
        }
      })
      .catch(() => setStatus("error"));
  }, [reference]);

  return (
    <div className="mx-auto max-w-md px-4 py-16 text-center">
      <Card>
        <CardContent className="pt-8 pb-8">
          {status === "loading" && (
            <>
              <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
              <h1 className="text-xl font-bold">Confirming payment...</h1>
              <p className="text-muted-foreground mt-2 text-sm">
                Please wait while we activate your subscription.
              </p>
            </>
          )}

          {status === "success" && (
            <>
              <CheckCircle className="h-12 w-12 text-emerald-500 mx-auto mb-4" />
              <h1 className="text-xl font-bold">Payment successful!</h1>
              <p className="text-muted-foreground mt-2 text-sm">
                {planName
                  ? `Your ${planName} plan is now active. Credits have been added to your account.`
                  : "Your subscription is now active. Credits have been added to your account."}
              </p>
              <Link href="/dashboard" className="mt-6 inline-block">
                <Button>Go to Dashboard</Button>
              </Link>
            </>
          )}

          {status === "pending" && (
            <>
              <Loader2 className="h-12 w-12 text-amber-500 mx-auto mb-4" />
              <h1 className="text-xl font-bold">Payment pending</h1>
              <p className="text-muted-foreground mt-2 text-sm">
                Your payment is being processed. Credits will be added once confirmed.
              </p>
              <Link href="/dashboard" className="mt-6 inline-block">
                <Button variant="outline">Go to Dashboard</Button>
              </Link>
            </>
          )}

          {status === "error" && (
            <>
              <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h1 className="text-xl font-bold">Payment issue</h1>
              <p className="text-muted-foreground mt-2 text-sm">
                We couldn&apos;t confirm your payment. Contact support if you were charged.
              </p>
              <Link href="/pricing" className="mt-6 inline-block">
                <Button variant="outline">Back to Pricing</Button>
              </Link>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
