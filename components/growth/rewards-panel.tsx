"use client";

import { useEffect, useState } from "react";
import { Copy, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function RewardsPanel() {
  const [referralCode, setReferralCode] = useState("");
  const [referralInput, setReferralInput] = useState("");
  const [couponInput, setCouponInput] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch("/api/referrals/code")
      .then((res) => res.json())
      .then((data) => setReferralCode(data.code ?? ""))
      .catch(() => setReferralCode(""));
  }, []);

  async function redeemReferral() {
    if (!referralInput.trim()) return;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const res = await fetch("/api/referrals/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: referralInput }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to redeem referral");
      setMessage(data.message || "Referral redeemed.");
      setReferralInput("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to redeem referral.");
    } finally {
      setBusy(false);
    }
  }

  async function redeemCouponCode() {
    if (!couponInput.trim()) return;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const res = await fetch("/api/coupons/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponInput }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to redeem coupon");
      setMessage(data.message || "Coupon redeemed.");
      setCouponInput("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to redeem coupon.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Gift className="h-4 w-4 text-primary" />
          Referral & Coupon Rewards
        </CardTitle>
        <CardDescription>
          Invite friends and redeem coupons to earn bonus credits.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-md border p-3">
          <p className="mb-2 text-xs text-muted-foreground">Your referral code</p>
          <div className="flex items-center gap-2">
            <Input value={referralCode || "Loading..."} readOnly />
            <Button
              variant="outline"
              size="icon"
              onClick={() => void navigator.clipboard.writeText(referralCode)}
              disabled={!referralCode}
              aria-label="Copy referral code"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
          <Input
            value={referralInput}
            onChange={(e) => setReferralInput(e.target.value)}
            placeholder="Enter referral code"
          />
          <Button onClick={() => void redeemReferral()} disabled={busy}>
            Redeem Referral
          </Button>
        </div>

        <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
          <Input
            value={couponInput}
            onChange={(e) => setCouponInput(e.target.value)}
            placeholder="Enter coupon code"
          />
          <Button variant="outline" onClick={() => void redeemCouponCode()} disabled={busy}>
            Redeem Coupon
          </Button>
        </div>

        {message ? <p className="text-sm text-emerald-600">{message}</p> : null}
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
      </CardContent>
    </Card>
  );
}
