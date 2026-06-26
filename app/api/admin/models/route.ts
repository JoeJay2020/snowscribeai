import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin, isErrorResponse } from "@/lib/api/auth";
import { getAdminDb } from "@/lib/firebase/admin";
import { DEFAULT_MODELS } from "@/lib/ai/models";
import type { ModelConfig } from "@/types/ai";

export async function GET() {
  const admin = await requireAdmin();
  if (isErrorResponse(admin)) {
    // Return defaults for non-admin during setup
    return NextResponse.json({ models: DEFAULT_MODELS });
  }

  try {
    const db = getAdminDb();
    const snapshot = await db.collection("modelConfigs").orderBy("priority").get();

    if (snapshot.empty) {
      return NextResponse.json({ models: DEFAULT_MODELS });
    }

    const models = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return NextResponse.json({ models });
  } catch {
    return NextResponse.json({ models: DEFAULT_MODELS });
  }
}

const updateSchema = z.object({
  models: z.array(
    z.object({
      id: z.string(),
      modelId: z.string(),
      displayName: z.string(),
      tier: z.enum(["simple", "medium", "complex"]),
      enabled: z.boolean(),
      priority: z.number(),
      costPer1kInput: z.number(),
      costPer1kOutput: z.number(),
      maxTokens: z.number(),
    })
  ),
});

export async function PUT(request: NextRequest) {
  const admin = await requireAdmin();
  if (isErrorResponse(admin)) return admin;

  try {
    const body = await request.json();
    const { models } = updateSchema.parse(body);
    const db = getAdminDb();
    const batch = db.batch();

    for (const model of models) {
      const ref = db.collection("modelConfigs").doc(model.id);
      batch.set(ref, {
        ...model,
        provider: "openrouter",
        updatedAt: new Date().toISOString(),
        updatedBy: admin.uid,
      } as ModelConfig & { updatedAt: string; updatedBy: string });
    }

    await batch.commit();
    return NextResponse.json({ success: true, count: models.length });
  } catch (error) {
    console.error("Model config update error:", error);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}
