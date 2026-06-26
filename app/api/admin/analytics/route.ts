import { NextResponse } from "next/server";
import { requireAdmin, isErrorResponse } from "@/lib/api/auth";
import { getAdminDb } from "@/lib/firebase/admin";

export async function GET() {
  const admin = await requireAdmin();
  if (isErrorResponse(admin)) return admin;

  try {
    const db = getAdminDb();
    const [usersSnap, requestsSnap, txSnap, referralsSnap, couponSnap] =
      await Promise.all([
        db.collection("users").count().get(),
        db.collection("aiRequests").count().get(),
        db.collection("creditTransactions").where("type", "==", "purchase").get(),
        db.collection("referrals").count().get(),
        db.collection("couponRedemptions").count().get(),
      ]);

    const revenueUsd = txSnap.docs.reduce(
      (sum, doc) => sum + Math.max(0, Number(doc.data().amount ?? 0)),
      0
    );

    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const recentRequests = (
      await db
        .collection("aiRequests")
        .where("createdAt", ">=", new Date(sevenDaysAgo).toISOString())
        .get()
    ).size;

    const toolCounts = new Map<string, number>();
    for (const doc of (
      await db.collection("aiRequests").orderBy("createdAt", "desc").limit(300).get()
    ).docs) {
      const toolId = String(doc.data().toolId ?? "unknown");
      toolCounts.set(toolId, (toolCounts.get(toolId) ?? 0) + 1);
    }

    const topTools = Array.from(toolCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([toolId, requests]) => ({ toolId, requests }));

    return NextResponse.json({
      totals: {
        users: usersSnap.data().count,
        aiRequests: requestsSnap.data().count,
        revenueUsd,
        referrals: referralsSnap.data().count,
        couponRedemptions: couponSnap.data().count,
      },
      trends: {
        requestsLast7Days: recentRequests,
      },
      topTools,
    });
  } catch (error) {
    console.error("Admin analytics error:", error);
    return NextResponse.json(
      { error: "Failed to load analytics" },
      { status: 500 }
    );
  }
}
