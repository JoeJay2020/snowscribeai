import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createSessionCookie } from "@/lib/firebase/auth";
import { ensureUserProvisionedFromIdToken } from "@/lib/auth/provision-user";
import { SESSION_COOKIE_NAME, SESSION_COOKIE_MAX_AGE } from "@/lib/constants";
import { isFirebaseAdminConfigured } from "@/lib/env/server";
import { rateLimit, getClientIp } from "@/lib/security";

const sessionSchema = z.object({
  idToken: z.string().min(1),
});

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const limit = rateLimit(`auth-session:${ip}`, 10, 60_000);
  if (!limit.success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  if (!isFirebaseAdminConfigured()) {
    return NextResponse.json(
      { error: "Authentication service not configured" },
      { status: 503 }
    );
  }

  try {
    const body = await request.json();
    const { idToken } = sessionSchema.parse(body);
    await ensureUserProvisionedFromIdToken(idToken);
    const sessionCookie = await createSessionCookie(idToken);

    const response = NextResponse.json({ success: true });
    response.cookies.set(SESSION_COOKIE_NAME, sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: SESSION_COOKIE_MAX_AGE,
      path: "/",
    });

    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    const message =
      error instanceof Error ? error.message : "Authentication failed";
    const status = message.includes("not valid JSON") ||
      message.includes("not configured")
      ? 503
      : 401;
    return NextResponse.json({ error: message }, { status });
  }
}
