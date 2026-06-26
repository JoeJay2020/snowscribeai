import { NextRequest, NextResponse } from "next/server";
import {
  checkPaymentStatus,
  planIdFromReference,
  userIdFromReference,
  isPesepayConfigured,
} from "@/lib/billing/pesepay";
import { getAdminDb } from "@/lib/firebase/admin";
import { renewMonthlyCredits } from "@/lib/credits/engine";
import { PLANS } from "@/lib/constants";
import { reportError } from "@/lib/observability/events";

export async function POST(request: NextRequest) {
  if (!isPesepayConfigured()) {
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }

  try {
    const body = await request.json();
    const referenceNumber =
      body.referenceNumber ?? body.reference ?? body.merchantReference;

    if (!referenceNumber) {
      await reportError({
        type: "payment_webhook_missing_reference",
        source: "api/billing/pesepay/webhook",
        message: "Webhook payload missing reference number.",
        severity: "warning",
      });
      return NextResponse.json({ error: "Missing reference" }, { status: 400 });
    }

    const status = await checkPaymentStatus(referenceNumber);

    if (!status.paid) {
      return NextResponse.json({ status: "pending", paid: false });
    }

    const userId = userIdFromReference(referenceNumber);
    const planId = planIdFromReference(referenceNumber);

    if (!userId || !planId) {
      await reportError({
        type: "payment_webhook_invalid_reference",
        source: "api/billing/pesepay/webhook",
        message: "Unable to parse userId/planId from reference.",
        severity: "warning",
        metadata: { referenceNumber },
      });
      return NextResponse.json({ error: "Invalid reference" }, { status: 400 });
    }

    const db = getAdminDb();
    const paymentRef = db.collection("pendingPayments").doc(referenceNumber);
    const paymentDoc = await paymentRef.get();

    if (paymentDoc.exists && paymentDoc.data()?.status === "completed") {
      return NextResponse.json({ status: "completed", paid: true });
    }

    const now = new Date();
    const periodEnd = new Date();
    periodEnd.setMonth(periodEnd.getMonth() + 1);

    await db.collection("users").doc(userId).update({
      plan: planId,
      updatedAt: now.toISOString(),
    });

    await db.collection("subscriptions").doc(userId).set({
      userId,
      planId,
      status: "active",
      provider: "pesepay",
      providerSubscriptionId: referenceNumber,
      currentPeriodStart: now.toISOString(),
      currentPeriodEnd: periodEnd.toISOString(),
      cancelAtPeriodEnd: false,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    });

    await renewMonthlyCredits(userId, planId);

    await paymentRef.set(
      {
        status: "completed",
        completedAt: now.toISOString(),
      },
      { merge: true }
    );

    return NextResponse.json({
      status: "completed",
      paid: true,
      plan: PLANS[planId].name,
    });
  } catch (error) {
    await reportError({
      type: "payment_webhook_exception",
      source: "api/billing/pesepay/webhook",
      message: "Pesepay webhook processing failed.",
      severity: "critical",
      error,
      alert: true,
    });
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
