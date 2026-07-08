import { getAdminAuth, getAdminDb } from "@/lib/firebase/admin";
import { PLANS } from "@/lib/constants";

export async function ensureUserProvisioned(
  uid: string,
  email: string | null,
  displayName: string | null
): Promise<void> {
  const db = getAdminDb();
  const userRef = db.collection("users").doc(uid);
  const walletRef = db.collection("creditWallets").doc(uid);
  const now = new Date().toISOString();

  const [userDoc, walletDoc] = await Promise.all([
    userRef.get(),
    walletRef.get(),
  ]);

  if (!userDoc.exists) {
    await userRef.set({
      email: email ?? "",
      displayName: displayName ?? email?.split("@")[0] ?? "User",
      photoURL: null,
      plan: "FREE",
      role: "user",
      onboardingComplete: false,
      createdAt: now,
      updatedAt: now,
    });
  }

  if (!walletDoc.exists) {
    const renewsAt = new Date();
    renewsAt.setMonth(renewsAt.getMonth() + 1);

    await walletRef.set({
      balance: PLANS.FREE.monthlyCredits,
      monthlyAllocation: PLANS.FREE.monthlyCredits,
      monthlyUsed: 0,
      renewsAt: renewsAt.toISOString(),
      updatedAt: now,
    });
  }
}

export async function ensureUserProvisionedFromIdToken(
  idToken: string
): Promise<void> {
  const decoded = await getAdminAuth().verifyIdToken(idToken);
  await ensureUserProvisioned(
    decoded.uid,
    decoded.email ?? null,
    decoded.name ?? null
  );
}
