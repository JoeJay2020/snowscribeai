import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth, isErrorResponse } from "@/lib/api/auth";
import { redeemCoupon } from "@/lib/growth/referrals";
import { sanitizeInput } from "@/lib/security";

const redeemSchema = z.object({
  code: z.string().min(3).max(32),
});

export async function POST(request: NextRequest) {
  const user = await requireAuth();
  if (isErrorResponse(user)) return user;

  try {
    const parsed = redeemSchema.parse(await request.json());
    const result = await redeemCoupon(user.uid, sanitizeInput(parsed.code, 32));
    return NextResponse.json({
      success: true,
      code: result.code,
      creditsAwarded: result.creditsAwarded,
      message: `${result.creditsAwarded} credits added to your wallet.`,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to redeem coupon" },
      { status: 400 }
    );
  }
}
