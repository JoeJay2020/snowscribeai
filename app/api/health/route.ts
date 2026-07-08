import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  try {
    const { getPlatformStatus } = await import("@/lib/platform/status");
    const report = await getPlatformStatus();
    const statusCode = report.overall === "down" ? 503 : 200;
    return NextResponse.json(report, { status: statusCode });
  } catch (error) {
    return NextResponse.json(
      {
        overall: "down",
        timestamp: new Date().toISOString(),
        services: [
          {
            name: "platform",
            state: "down",
            details: error instanceof Error ? error.message : "Health check failed",
          },
        ],
      },
      { status: 503 }
    );
  }
}
