import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  type Timestamp,
} from "firebase/firestore";
import { getFirebaseDb } from "./client";
import { PLANS } from "@/lib/constants";
import type { UserProfile, CreditWallet } from "@/types/database";

function timestampToIso(value: Timestamp | string | undefined): string {
  if (!value) return new Date().toISOString();
  if (typeof value === "string") return value;
  return value.toDate().toISOString();
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const db = getFirebaseDb();
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return null;
  const data = snap.data();
  return {
    uid,
    email: data.email,
    displayName: data.displayName,
    photoURL: data.photoURL ?? null,
    plan: data.plan ?? "FREE",
    role: data.role ?? "user",
    createdAt: timestampToIso(data.createdAt),
    updatedAt: timestampToIso(data.updatedAt),
    onboardingComplete: data.onboardingComplete ?? false,
  };
}

export async function getCreditWallet(
  userId: string
): Promise<CreditWallet | null> {
  const db = getFirebaseDb();
  const snap = await getDoc(doc(db, "creditWallets", userId));
  if (!snap.exists()) return null;
  const data = snap.data();
  return {
    userId,
    balance: data.balance ?? 0,
    monthlyAllocation: data.monthlyAllocation ?? PLANS.FREE.monthlyCredits,
    monthlyUsed: data.monthlyUsed ?? 0,
    renewsAt: timestampToIso(data.renewsAt),
    updatedAt: timestampToIso(data.updatedAt),
  };
}

export async function createUserProfile(
  uid: string,
  email: string,
  displayName: string
): Promise<void> {
  const db = getFirebaseDb();
  const existing = await getDoc(doc(db, "users", uid));
  if (existing.exists()) return;

  const now = serverTimestamp();

  await setDoc(doc(db, "users", uid), {
    email,
    displayName,
    photoURL: null,
    plan: "FREE",
    role: "user",
    onboardingComplete: false,
    createdAt: now,
    updatedAt: now,
  });

  const renewsAt = new Date();
  renewsAt.setMonth(renewsAt.getMonth() + 1);

  await setDoc(doc(db, "creditWallets", uid), {
    balance: PLANS.FREE.monthlyCredits,
    monthlyAllocation: PLANS.FREE.monthlyCredits,
    monthlyUsed: 0,
    renewsAt: renewsAt.toISOString(),
    updatedAt: now,
  });
}
