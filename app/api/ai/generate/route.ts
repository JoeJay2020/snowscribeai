import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth, isErrorResponse } from "@/lib/api/auth";
import { routeAndGenerate } from "@/lib/ai/router";
import {
  checkAndDeductCredits,
  ensureWallet,
  InsufficientCreditsError,
  DailyLimitError,
} from "@/lib/credits/engine";
import { getToolDefinition } from "@/lib/tools";
import { getAdminDb } from "@/lib/firebase/admin";
import { isOpenRouterConfigured } from "@/lib/env/server";
import { rateLimit, getClientIp, sanitizeInput } from "@/lib/security";
import { reportError } from "@/lib/observability/events";

export const runtime = "nodejs";

const generateSchema = z.object({
  toolId: z.string().min(1),
  inputs: z.record(z.string(), z.string()),
});

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const limit = rateLimit(`ai-generate:${ip}`, 10, 60_000);
  if (!limit.success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  if (!isOpenRouterConfigured()) {
    return NextResponse.json(
      { error: "AI service not configured. Set OPENROUTER_API_KEY." },
      { status: 503 }
    );
  }

  const user = await requireAuth();
  if (isErrorResponse(user)) return user;

  try {
    const body = await request.json();
    const { toolId, inputs } = generateSchema.parse(body);

    const tool = getToolDefinition(toolId);
    if (!tool) {
      return NextResponse.json({ error: "Unknown tool" }, { status: 400 });
    }

    for (const field of tool.fields) {
      if (field.required && !inputs[field.id]?.trim()) {
        return NextResponse.json(
          { error: `${field.label} is required` },
          { status: 400 }
        );
      }
    }

    const wallet = await ensureWallet(user.uid);
    if (wallet.balance < tool.creditCost) {
      return NextResponse.json(
        {
          error: `Insufficient credits: need ${tool.creditCost}, have ${wallet.balance}`,
          code: "INSUFFICIENT_CREDITS",
        },
        { status: 402 }
      );
    }

    const sanitizedInputs: Record<string, string> = {};
    for (const [key, value] of Object.entries(inputs)) {
      sanitizedInputs[key] = sanitizeInput(value, 10_000);
    }

    const userPrompt = tool.buildUserPrompt(sanitizedInputs);
    const result = await routeAndGenerate(
      toolId,
      sanitizedInputs,
      tool.systemPrompt,
      userPrompt
    );

    const { newBalance, transactionId } = await checkAndDeductCredits(
      user.uid,
      tool.creditCost,
      toolId,
      `${tool.name} generation`
    );

    const db = getAdminDb();
    const requestRef = await db.collection("aiRequests").add({
      userId: user.uid,
      toolId,
      taskType: result.tier,
      modelUsed: result.modelUsed,
      creditsConsumed: tool.creditCost,
      tokensIn: result.tokensIn,
      tokensOut: result.tokensOut,
      costUsd: result.costUsd,
      status: "completed",
      creditTransactionId: transactionId,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({
      content: result.content,
      creditsUsed: tool.creditCost,
      creditsRemaining: newBalance,
      modelUsed: result.modelUsed,
      requestId: requestRef.id,
    });
  } catch (error) {
    if (error instanceof InsufficientCreditsError) {
      return NextResponse.json(
        { error: error.message, code: "INSUFFICIENT_CREDITS" },
        { status: 402 }
      );
    }
    if (error instanceof DailyLimitError) {
      return NextResponse.json(
        { error: error.message, code: "DAILY_LIMIT" },
        { status: 429 }
      );
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    await reportError({
      type: "ai_generation_failed",
      source: "api/ai/generate",
      message: "AI generation failed.",
      userId: user.uid,
      error,
      metadata: {
        ip,
      },
      alert: true,
    });
    return NextResponse.json(
      { error: "Generation failed. No credits were deducted." },
      { status: 500 }
    );
  }
}
