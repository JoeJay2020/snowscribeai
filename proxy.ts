import { NextResponse, type NextRequest } from "next/server";
import {
  AUTH_ROUTES,
  PROTECTED_ROUTES,
  SESSION_COOKIE_NAME,
} from "@/lib/constants";

/**
 * Edge-safe route guard. Checks session cookie presence only.
 * Full verification runs in dashboard layout + API routes (Node.js).
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route)
  );
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));

  if (!isProtected && !isAuthRoute) {
    return NextResponse.next();
  }

  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const hasSession = Boolean(sessionCookie);

  // Protected routes: require session cookie (layout verifies it server-side).
  if (isProtected && !hasSession) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Do NOT redirect auth routes when a cookie exists — stale/invalid cookies
  // caused /login <-> /dashboard redirect loops. Login page checks session server-side.

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard",
    "/dashboard/:path*",
    "/tools",
    "/tools/:path*",
    "/workspace",
    "/workspace/:path*",
    "/assistant",
    "/assistant/:path*",
    "/admin",
    "/admin/:path*",
    "/billing",
    "/billing/:path*",
    "/login",
    "/register",
  ],
};
