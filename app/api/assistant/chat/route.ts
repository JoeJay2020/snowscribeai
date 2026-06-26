import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth, isErrorResponse } from "@/lib/api/auth";
import { routeAndGenerate } from "@/lib/ai/router";
import {
  checkAndDeductCredits,
  getWallet,
  InsufficientCreditsError,
  DailyLimitError,
} from "@/lib/credits/engine";
import { getAdminDb } from "@/lib/firebase/admin";
import { isOpenRouterConfigured } from "@/lib/env/server";
import { getClientIp, rateLimit, sanitizeInput } from "@/lib/security";
import { addMessage, createThread, getThread } from "@/lib/assistant/store";
import { parseAttachment } from "@/lib/assistant/parsers";
import { reportError } from "@/lib/observability/events";

const CHAT_CREDIT_COST = 12;
const MAX_ATTACHMENTS = 3;
const MAX_ATTACHMENT_CHARS = 12_000;

const attachmentSchema = z.object({
  name: z.string().min(1).max(120),
  content: z.string().min(1),
  mimeType: z.string().max(160).optional(),
});

const chatSchema = z.object({
  threadId: z.string().min(1).optional(),
  message: z.string().min(5).max(8_000),
  attachments: z.array(attachmentSchema).max(MAX_ATTACHMENTS).default([]),
});

function buildAssistantPrompt(
  message: string,
  attachments: Array<{ name: string; content: string }>
): string {
  const attachmentContext =
    attachments.length === 0
      ? ""
      : `\n\nAttached reference files:\n${attachments
          .map(
            (file, index) =>
              `File ${index + 1}: ${file.name}\n${file.content.slice(
                0,
                MAX_ATTACHMENT_CHARS
              )}`
          )
          .join("\n\n---\n\n")}`;

  return `User question/request:
${message}${attachmentContext}

Respond with:
1) A direct answer first.
2) If relevant, recommended next academic steps.
3) Keep a clear scholarly tone and avoid fabricated citations.`;
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const limit = rateLimit(`assistant-chat:${ip}`, 20, 60_000);
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
    const body = chatSchema.parse(await request.json());
    const message = sanitizeInput(body.message, 8_000);
    const parsedAttachments = await Promise.all(
      body.attachments.map((file) =>
        parseAttachment({
          name: sanitizeInput(file.name, 120),
          content: file.content,
          mimeType: file.mimeType,
        })
      )
    );
    const attachments = parsedAttachments
      .map((file) => ({
        name: file.name,
        mimeType: file.mimeType,
        content: sanitizeInput(file.content, MAX_ATTACHMENT_CHARS),
      }))
      .filter((file) => file.content.length > 0);

    let activeThreadId = body.threadId;
    if (activeThreadId) {
      const existing = await getThread(user.uid, activeThreadId);
      if (!existing) {
        return NextResponse.json({ error: "Thread not found" }, { status: 404 });
      }
    } else {
      const title = sanitizeInput(message.split("\n")[0], 80) || "New Assistant Chat";
      const thread = await createThread(user.uid, title);
      activeThreadId = thread.id;
    }

    const wallet = await getWallet(user.uid);
    if (!wallet || wallet.balance < CHAT_CREDIT_COST) {
      return NextResponse.json(
        {
          error: `Insufficient credits: need ${CHAT_CREDIT_COST}, have ${
            wallet?.balance ?? 0
          }`,
          code: "INSUFFICIENT_CREDITS",
        },
        { status: 402 }
      );
    }

    const systemPrompt =
      "You are SnowScribe Assistant, an academic writing and research copilot. " +
      "Be concise, structured, and practical. Never invent sources or claim to have read papers that were not provided.";

    const userPrompt = buildAssistantPrompt(message, attachments);
    const result = await routeAndGenerate(
      "assistant-chat",
      { message, attachmentCount: String(attachments.length) },
      systemPrompt,
      userPrompt
    );

    const { newBalance, transactionId } = await checkAndDeductCredits(
      user.uid,
      CHAT_CREDIT_COST,
      "assistant-chat",
      "Assistant chat response"
    );

    const db = getAdminDb();
    const requestRef = await db.collection("aiRequests").add({
      userId: user.uid,
      toolId: "assistant-chat",
      taskType: result.tier,
      modelUsed: result.modelUsed,
      creditsConsumed: CHAT_CREDIT_COST,
      tokensIn: result.tokensIn,
      tokensOut: result.tokensOut,
      costUsd: result.costUsd,
      status: "completed",
      creditTransactionId: transactionId,
      createdAt: new Date().toISOString(),
      meta: {
        hasAttachments: attachments.length > 0,
        attachmentCount: attachments.length,
        threadId: activeThreadId,
      },
    });

    await addMessage(user.uid, activeThreadId, {
      role: "user",
      content: message,
      attachments: attachments.map((a) => ({
        name: a.name,
        mimeType: a.mimeType,
      })),
    });
    await addMessage(user.uid, activeThreadId, {
      role: "assistant",
      content: result.content,
      modelUsed: result.modelUsed,
    });

    return NextResponse.json({
      threadId: activeThreadId,
      content: result.content,
      creditsUsed: CHAT_CREDIT_COST,
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
      return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
    }

    await reportError({
      type: "assistant_chat_failed",
      source: "api/assistant/chat",
      message: "Assistant chat generation failed.",
      userId: user.uid,
      error,
      metadata: { ip },
      alert: true,
    });
    return NextResponse.json(
      { error: "Assistant failed. No credits were deducted." },
      { status: 500 }
    );
  }
}
