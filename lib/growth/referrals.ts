import { getAdminDb } from "@/lib/firebase/admin";
import { addCredits } from "@/lib/credits/engine";

const REFERRAL_BONUS_CREDITS = 25;

function normalizeCode(code: string): string {
  return code.trim().toUpperCase();
}

function randomCode(length = 8): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < length; i++) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return out;
}

export async function ensureReferralCode(userId: string): Promise<string> {
  const db = getAdminDb();
  const userRef = db.collection("users").doc(userId);
  const userDoc = await userRef.get();
  if (!userDoc.exists) throw new Error("User not found");

  const existing = userDoc.data()?.referralCode as string | undefined;
  if (existing) return existing;

  let code = randomCode();
  // Simple retry loop for uniqueness
  for (let i = 0; i < 5; i++) {
    const snap = await db
      .collection("users")
      .where("referralCode", "==", code)
      .limit(1)
      .get();
    if (snap.empty) break;
    code = randomCode();
  }

  await userRef.update({
    referralCode: code,
    updatedAt: new Date().toISOString(),
  });
  return code;
}

export async function redeemReferralCode(
  userId: string,
  rawCode: string
): Promise<{ code: string; inviterUserId: string }> {
  const code = normalizeCode(rawCode);
  const db = getAdminDb();
  const userRef = db.collection("users").doc(userId);
  const userDoc = await userRef.get();
  if (!userDoc.exists) throw new Error("User not found");

  const profile = userDoc.data() ?? {};
  if (profile.referredBy) {
    throw new Error("Referral already redeemed");
  }

  const inviterSnap = await db
    .collection("users")
    .where("referralCode", "==", code)
    .limit(1)
    .get();
  if (inviterSnap.empty) {
    throw new Error("Invalid referral code");
  }

  const inviter = inviterSnap.docs[0];
  if (inviter.id === userId) {
    throw new Error("You cannot redeem your own code");
  }

  await userRef.update({
    referredBy: inviter.id,
    referredAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  await db.collection("referrals").add({
    code,
    inviterUserId: inviter.id,
    inviteeUserId: userId,
    rewardCredits: REFERRAL_BONUS_CREDITS,
    status: "completed",
    createdAt: new Date().toISOString(),
  });

  await Promise.all([
    addCredits(
      inviter.id,
      REFERRAL_BONUS_CREDITS,
      "credit",
      "Referral bonus (inviter)"
    ),
    addCredits(
      userId,
      REFERRAL_BONUS_CREDITS,
      "credit",
      "Referral bonus (invitee)"
    ),
  ]);

  return { code, inviterUserId: inviter.id };
}

export async function redeemCoupon(
  userId: string,
  rawCode: string
): Promise<{ code: string; creditsAwarded: number }> {
  const code = normalizeCode(rawCode);
  const db = getAdminDb();
  const couponRef = db.collection("coupons").doc(code);

  const couponDoc = await couponRef.get();
  if (!couponDoc.exists) {
    throw new Error("Coupon not found");
  }
  const coupon = couponDoc.data()!;
  if (coupon.active === false) {
    throw new Error("Coupon inactive");
  }
  if (coupon.expiresAt && new Date(coupon.expiresAt).getTime() < Date.now()) {
    throw new Error("Coupon expired");
  }

  const redemptionId = `${code}_${userId}`;
  const redemptionRef = db.collection("couponRedemptions").doc(redemptionId);
  const redemptionDoc = await redemptionRef.get();
  if (redemptionDoc.exists) {
    throw new Error("Coupon already redeemed");
  }

  const credits = Number(coupon.credits ?? 0);
  if (!Number.isFinite(credits) || credits <= 0) {
    throw new Error("Invalid coupon credits");
  }

  await redemptionRef.set({
    code,
    userId,
    credits,
    createdAt: new Date().toISOString(),
  });

  await addCredits(userId, credits, "credit", `Coupon redeemed: ${code}`);
  await couponRef.set(
    {
      totalRedemptions: (coupon.totalRedemptions ?? 0) + 1,
      updatedAt: new Date().toISOString(),
    },
    { merge: true }
  );

  return { code, creditsAwarded: credits };
}
