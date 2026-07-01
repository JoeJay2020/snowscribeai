import { NextResponse, type NextRequest } from "next/server";
import {
  AUTH_ROUTES,
  PROTECTED_ROUTES,
  SESSION_COOKIE_NAME,
} from "@/lib/constants";

/**
 * Edge-safe route guard. Only checks for the session cookie presence.
 * Full Firebase session verification runs in server components and API routes (Node.js).
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route)
  );
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));

  if (!isProtected && !isAuthRoute) {
    return NextResponse.next();
  }

  const hasSession = Boolean(request.cookies.get(SESSION_COOKIE_NAME)?.value);

  if (isProtected && !hasSession) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthRoute && hasSession) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/tools/:path*",
    "/workspace/:path*",
    "/assistant/:path*",
    "/admin/:path*",
    "/billing/:path*",
    "/login",
    "/register",
  ],
};
