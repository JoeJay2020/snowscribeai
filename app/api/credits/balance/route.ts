import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth, isErrorResponse } from "@/lib/api/auth";
import { getWallet } from "@/lib/credits/engine";
import { getTransactionHistory } from "@/lib/credits/engine";
import { rateLimit, getClientIp } from "@/lib/security";

export async function GET(request: NextRequest) {
  const ip = getClientIp(request);
  const limit = rateLimit(`credits:${ip}`, 30, 60_000);
  if (!limit.success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const user = await requireAuth();
  if (isErrorResponse(user)) return user;

  const wallet = await getWallet(user.uid);
  const transactions = await getTransactionHistory(user.uid, 10);

  return NextResponse.json({
    balance: wallet?.balance ?? user.credits,
    monthlyAllocation: wallet?.monthlyAllocation ?? 50,
    monthlyUsed: wallet?.monthlyUsed ?? 0,
    plan: user.plan,
    transactions,
  });
}
