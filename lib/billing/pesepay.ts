import { Pesepay } from "pesepay";
import { serverEnv } from "@/lib/env/server";
import { PLANS, type PlanId } from "@/lib/constants";
import { clientEnv } from "@/lib/env/client";

export function isPesepayConfigured(): boolean {
  return Boolean(
    serverEnv.PESEPAY_INTEGRATION_KEY && serverEnv.PESEPAY_ENCRYPTION_KEY
  );
}

export function getPesepayClient(): Pesepay {
  if (!isPesepayConfigured()) {
    throw new Error("Pesepay is not configured");
  }

  const client = new Pesepay(
    serverEnv.PESEPAY_INTEGRATION_KEY!,
    serverEnv.PESEPAY_ENCRYPTION_KEY!
  );

  client.resultUrl =
    serverEnv.PESEPAY_RESULT_URL ??
    `${clientEnv.NEXT_PUBLIC_APP_URL}/api/billing/pesepay/webhook`;
  client.returnUrl =
    serverEnv.PESEPAY_RETURN_URL ??
    `${clientEnv.NEXT_PUBLIC_APP_URL}/billing/success`;

  return client;
}

export interface InitiatePaymentResult {
  success: boolean;
  redirectUrl?: string;
  referenceNumber?: string;
  pollUrl?: string;
  message?: string;
}

export async function initiatePlanPayment(
  planId: PlanId,
  userId: string,
  userEmail: string
): Promise<InitiatePaymentResult> {
  const plan = PLANS[planId];
  if (!plan || plan.price === null || plan.price === 0) {
    throw new Error("Invalid plan for payment");
  }

  const pesepay = getPesepayClient();
  const merchantReference = `snowscribe_${userId}_${planId}_${Date.now()}`;

  const transaction = pesepay.createTransaction(
    plan.price,
    "USD",
    `SnowScribe.ai ${plan.name} Plan Subscription`
  );

  const response = await pesepay.initiateTransaction(transaction);

  if (response.success) {
    return {
      success: true,
      redirectUrl: response.redirectUrl,
      referenceNumber: response.referenceNumber,
      pollUrl: response.pollUrl,
    };
  }

  return {
    success: false,
    message: response.message ?? "Payment initiation failed",
  };
}

export async function checkPaymentStatus(
  referenceNumber: string
): Promise<{ paid: boolean; message?: string }> {
  const pesepay = getPesepayClient();
  const status = await pesepay.checkPayment(referenceNumber);
  return {
    paid: status.paid ?? false,
    message: status.message,
  };
}

export function planIdFromReference(reference: string): PlanId | null {
  const parts = reference.split("_");
  const planKey = parts[2]?.toUpperCase() as PlanId;
  if (planKey && planKey in PLANS) return planKey;
  return null;
}

export function userIdFromReference(reference: string): string | null {
  const parts = reference.split("_");
  return parts[1] ?? null;
}
