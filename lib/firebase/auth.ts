import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME } from "@/lib/constants";
import { isFirebaseAdminConfigured } from "@/lib/env/server";
import type { SessionUser } from "@/types/auth";
import type { PlanId } from "@/lib/constants";
import { getAdminAuth, getAdminDb } from "./admin";

export async function createSessionCookie(idToken: string): Promise<string> {
  const auth = getAdminAuth();
  const expiresIn = 60 * 60 * 24 * 14 * 1000; // 14 days in ms
  return auth.createSessionCookie(idToken, { expiresIn });
}

export async function verifySessionCookie(
  sessionCookie: string
): Promise<SessionUser | null> {
  if (!isFirebaseAdminConfigured()) return null;

  try {
    const auth = getAdminAuth();
    const decoded = await auth.verifySessionCookie(sessionCookie, true);

    const db = getAdminDb();
    const userDoc = await db.collection("users").doc(decoded.uid).get();
    const walletDoc = await db.collection("creditWallets").doc(decoded.uid).get();

    const userData = userDoc.data();
    const walletData = walletDoc.data();

    return {
      uid: decoded.uid,
      email: decoded.email ?? null,
      displayName: decoded.name ?? userData?.displayName ?? null,
      photoURL: decoded.picture ?? userData?.photoURL ?? null,
      emailVerified: decoded.email_verified ?? false,
      plan: (userData?.plan as PlanId) ?? "FREE",
      role: userData?.role ?? "user",
      credits: walletData?.balance ?? 0,
    };
  } catch {
    return null;
  }
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionCookie) return null;
  return verifySessionCookie(sessionCookie);
}

export async function revokeSession(sessionCookie: string): Promise<void> {
  const auth = getAdminAuth();
  const decoded = await auth.verifySessionCookie(sessionCookie);
  await auth.revokeRefreshTokens(decoded.sub);
}
