import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/firebase/auth";
import type { SessionUser } from "@/types/auth";

export async function requireAuth(): Promise<SessionUser | NextResponse> {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return user;
}

export async function requireAdmin(): Promise<SessionUser | NextResponse> {
  const result = await requireAuth();
  if (result instanceof NextResponse) return result;
  if (result.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return result;
}

export function isErrorResponse(
  value: SessionUser | NextResponse
): value is NextResponse {
  return value instanceof NextResponse;
}
