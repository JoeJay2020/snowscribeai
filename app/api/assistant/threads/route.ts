import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth, isErrorResponse } from "@/lib/api/auth";
import { createThread, listThreads } from "@/lib/assistant/store";
import { getClientIp, rateLimit, sanitizeInput } from "@/lib/security";

const createThreadSchema = z.object({
  title: z.string().min(1).max(120).optional(),
});

export async function GET(request: NextRequest) {
  const ip = getClientIp(request);
  if (!rateLimit(`assistant-threads:${ip}`, 30, 60_000).success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const user = await requireAuth();
  if (isErrorResponse(user)) return user;

  try {
    const threads = await listThreads(user.uid);
    return NextResponse.json({ threads });
  } catch (error) {
    console.error("List assistant threads error:", error);
    return NextResponse.json(
      { error: "Failed to load chat history" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const user = await requireAuth();
  if (isErrorResponse(user)) return user;

  try {
    const parsed = createThreadSchema.parse(await request.json());
    const title = sanitizeInput(parsed.title ?? "New Assistant Chat", 120);
    const thread = await createThread(user.uid, title);
    return NextResponse.json({ thread }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
    }
    console.error("Create assistant thread error:", error);
    return NextResponse.json(
      { error: "Failed to create thread" },
      { status: 500 }
    );
  }
}
