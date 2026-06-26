import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth, isErrorResponse } from "@/lib/api/auth";
import { redeemReferralCode } from "@/lib/growth/referrals";
import { sanitizeInput } from "@/lib/security";

const redeemSchema = z.object({
  code: z.string().min(3).max(32),
});

export async function POST(request: NextRequest) {
  const user = await requireAuth();
  if (isErrorResponse(user)) return user;

  try {
    const parsed = redeemSchema.parse(await request.json());
    const result = await redeemReferralCode(user.uid, sanitizeInput(parsed.code, 32));
    return NextResponse.json({
      success: true,
      code: result.code,
      message: "Referral redeemed. 25 bonus credits added to both accounts.",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to redeem code" },
      { status: 400 }
    );
  }
}
