import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME } from "@/lib/constants";
import { revokeSession } from "@/lib/firebase/auth";
import { isFirebaseAdminConfigured } from "@/lib/env/server";
import { getSafeRedirectPath } from "@/lib/auth/redirect";

const CLEAR_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: 0,
  path: "/",
};

async function clearSessionCookie(): Promise<string | undefined> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (sessionCookie && isFirebaseAdminConfigured()) {
    try {
      await revokeSession(sessionCookie);
    } catch {
      // Session may already be invalid
    }
  }

  return sessionCookie;
}

export async function POST(_request: NextRequest) {
  await clearSessionCookie();

  const response = NextResponse.json({ success: true });
  response.cookies.set(SESSION_COOKIE_NAME, "", CLEAR_COOKIE_OPTIONS);
  return response;
}

export async function GET(request: NextRequest) {
  await clearSessionCookie();

  const redirectTo = getSafeRedirectPath(
    request.nextUrl.searchParams.get("redirect"),
    "/login"
  );

  const response = NextResponse.redirect(new URL(redirectTo, request.url));
  response.cookies.set(SESSION_COOKIE_NAME, "", CLEAR_COOKIE_OPTIONS);
  return response;
}
