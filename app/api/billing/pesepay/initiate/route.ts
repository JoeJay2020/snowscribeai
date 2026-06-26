import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth, isErrorResponse } from "@/lib/api/auth";
import {
  initiatePlanPayment,
  isPesepayConfigured,
} from "@/lib/billing/pesepay";
import { PLANS, type PlanId } from "@/lib/constants";
import { getAdminDb } from "@/lib/firebase/admin";
import { rateLimit, getClientIp } from "@/lib/security";
import { reportError } from "@/lib/observability/events";

const initiateSchema = z.object({
  planId: z.enum(["STUDENT", "PRO", "BUSINESS"]),
});

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const limit = rateLimit(`billing:${ip}`, 5, 60_000);
  if (!limit.success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  if (!isPesepayConfigured()) {
    return NextResponse.json(
      { error: "Payment service not configured" },
      { status: 503 }
    );
  }

  const user = await requireAuth();
  if (isErrorResponse(user)) return user;

  try {
    const body = await request.json();
    const { planId } = initiateSchema.parse(body);
    const plan = PLANS[planId as PlanId];

    if (!plan || plan.price === null || plan.price === 0) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const result = await initiatePlanPayment(
      planId as PlanId,
      user.uid,
      user.email ?? ""
    );

    if (!result.success) {
      await reportError({
        type: "payment_initiation_failed",
        source: "api/billing/pesepay/initiate",
        message: result.message ?? "Payment initiation failed",
        userId: user.uid,
        severity: "warning",
        metadata: { planId },
      });
      return NextResponse.json(
        { error: result.message ?? "Payment initiation failed" },
        { status: 400 }
      );
    }

    const db = getAdminDb();
    await db.collection("pendingPayments").doc(result.referenceNumber!).set({
      userId: user.uid,
      planId,
      referenceNumber: result.referenceNumber,
      pollUrl: result.pollUrl,
      amount: plan.price,
      status: "pending",
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({
      redirectUrl: result.redirectUrl,
      referenceNumber: result.referenceNumber,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    await reportError({
      type: "payment_initiation_exception",
      source: "api/billing/pesepay/initiate",
      message: "Payment initiation threw an exception.",
      userId: user.uid,
      error,
      metadata: { ip },
      alert: true,
    });
    return NextResponse.json({ error: "Payment failed" }, { status: 500 });
  }
}
