import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin, isErrorResponse } from "@/lib/api/auth";
import { getAdminDb } from "@/lib/firebase/admin";

const createCouponSchema = z.object({
  code: z
    .string()
    .min(3)
    .max(32)
    .regex(/^[A-Za-z0-9_-]+$/),
  credits: z.number().int().min(1).max(100000),
  expiresAt: z.string().datetime().optional().nullable(),
});

const updateCouponSchema = z.object({
  code: z.string().min(3).max(32),
  active: z.boolean().optional(),
  archived: z.boolean().optional(),
  credits: z.number().int().min(1).max(100000).optional(),
  expiresAt: z.string().datetime().optional().nullable(),
});

function normalizeCode(code: string): string {
  return code.trim().toUpperCase();
}

export async function GET() {
  const admin = await requireAdmin();
  if (isErrorResponse(admin)) return admin;

  try {
    const db = getAdminDb();
    const snap = await db.collection("coupons").orderBy("createdAt", "desc").limit(100).get();
    const coupons = snap.docs.map((doc) => ({
      code: doc.id,
      archived: false,
      ...doc.data(),
    }));
    return NextResponse.json({ coupons });
  } catch (error) {
    console.error("List coupons error:", error);
    return NextResponse.json({ error: "Failed to list coupons" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const admin = await requireAdmin();
  if (isErrorResponse(admin)) return admin;

  try {
    const parsed = createCouponSchema.parse(await request.json());
    const code = normalizeCode(parsed.code);
    const db = getAdminDb();
    const ref = db.collection("coupons").doc(code);
    const existing = await ref.get();
    if (existing.exists) {
      return NextResponse.json({ error: "Coupon code already exists" }, { status: 409 });
    }

    const now = new Date().toISOString();
    await ref.set({
      credits: parsed.credits,
      active: true,
      archived: false,
      expiresAt: parsed.expiresAt ?? null,
      totalRedemptions: 0,
      createdAt: now,
      updatedAt: now,
      createdBy: admin.uid,
      updatedBy: admin.uid,
    });

    return NextResponse.json({ success: true, code }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
    }
    console.error("Create coupon error:", error);
    return NextResponse.json({ error: "Failed to create coupon" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const admin = await requireAdmin();
  if (isErrorResponse(admin)) return admin;

  try {
    const parsed = updateCouponSchema.parse(await request.json());
    const code = normalizeCode(parsed.code);
    const db = getAdminDb();
    const ref = db.collection("coupons").doc(code);
    const existing = await ref.get();
    if (!existing.exists) {
      return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
    }

    const updates: Record<string, unknown> = {
      updatedAt: new Date().toISOString(),
      updatedBy: admin.uid,
    };
    if (parsed.active !== undefined) updates.active = parsed.active;
    if (parsed.archived !== undefined) updates.archived = parsed.archived;
    if (parsed.credits !== undefined) updates.credits = parsed.credits;
    if (parsed.expiresAt !== undefined) updates.expiresAt = parsed.expiresAt;

    await ref.update(updates);
    return NextResponse.json({ success: true, code });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
    }
    console.error("Update coupon error:", error);
    return NextResponse.json({ error: "Failed to update coupon" }, { status: 500 });
  }
}

const deleteCouponSchema = z.object({
  code: z.string().min(3).max(32),
  mode: z.enum(["archive", "delete"]).default("archive"),
});

export async function DELETE(request: NextRequest) {
  const admin = await requireAdmin();
  if (isErrorResponse(admin)) return admin;

  try {
    const parsed = deleteCouponSchema.parse(await request.json());
    const code = normalizeCode(parsed.code);
    const db = getAdminDb();
    const ref = db.collection("coupons").doc(code);
    const existing = await ref.get();
    if (!existing.exists) {
      return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
    }

    if (parsed.mode === "archive") {
      await ref.update({
        archived: true,
        active: false,
        updatedAt: new Date().toISOString(),
        updatedBy: admin.uid,
      });
      return NextResponse.json({ success: true, code, mode: "archive" });
    }

    await ref.delete();
    return NextResponse.json({ success: true, code, mode: "delete" });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
    }
    console.error("Delete coupon error:", error);
    return NextResponse.json({ error: "Failed to delete coupon" }, { status: 500 });
  }
}
