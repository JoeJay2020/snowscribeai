import { NextResponse } from "next/server";
import { requireAuth, isErrorResponse } from "@/lib/api/auth";
import { ensureReferralCode } from "@/lib/growth/referrals";

export async function GET() {
  const user = await requireAuth();
  if (isErrorResponse(user)) return user;

  try {
    const code = await ensureReferralCode(user.uid);
    return NextResponse.json({ code });
  } catch (error) {
    console.error("Get referral code error:", error);
    return NextResponse.json(
      { error: "Failed to load referral code" },
      { status: 500 }
    );
  }
}
