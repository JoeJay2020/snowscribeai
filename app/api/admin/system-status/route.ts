import { NextResponse } from "next/server";
import { requireAdmin, isErrorResponse } from "@/lib/api/auth";
import { getPlatformStatus } from "@/lib/platform/status";

export async function GET() {
  const admin = await requireAdmin();
  if (isErrorResponse(admin)) return admin;

  try {
    const report = await getPlatformStatus();
    return NextResponse.json(report);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch system status" },
      { status: 500 }
    );
  }
}
