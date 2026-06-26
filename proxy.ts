import { NextResponse, type NextRequest } from "next/server";
import {
  AUTH_ROUTES,
  PROTECTED_ROUTES,
  SESSION_COOKIE_NAME,
} from "@/lib/constants";
import { verifySessionCookie } from "@/lib/firebase/auth";
import { isFirebaseAdminConfigured } from "@/lib/env/server";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route)
  );
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));

  if (!isProtected && !isAuthRoute) {
    return NextResponse.next();
  }

  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  let user = null;

  if (sessionCookie && isFirebaseAdminConfigured()) {
    user = await verifySessionCookie(sessionCookie);
  }

  if (isProtected && !user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthRoute && user) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (pathname.startsWith("/admin") && user?.role !== "admin") {
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
