import { NextResponse } from "next/server";
import { requireAdmin, isErrorResponse } from "@/lib/api/auth";
import { getAdminDb } from "@/lib/firebase/admin";

export async function GET() {
  const admin = await requireAdmin();
  if (isErrorResponse(admin)) return admin;

  try {
    const db = getAdminDb();
    const snapshot = await db
      .collection("observabilityEvents")
      .orderBy("createdAt", "desc")
      .limit(100)
      .get();

    const events = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return NextResponse.json({ events });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to load observability events",
      },
      { status: 500 }
    );
  }
}
