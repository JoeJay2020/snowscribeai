import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth, isErrorResponse } from "@/lib/api/auth";
import { listDocuments, createDocument } from "@/lib/documents/store";
import { rateLimit, getClientIp, sanitizeInput } from "@/lib/security";

export async function GET(request: NextRequest) {
  const ip = getClientIp(request);
  if (!rateLimit(`docs:${ip}`, 30, 60_000).success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const user = await requireAuth();
  if (isErrorResponse(user)) return user;

  try {
    const documents = await listDocuments(user.uid);
    return NextResponse.json({ documents });
  } catch (error) {
    console.error("List documents error:", error);
    return NextResponse.json({ error: "Failed to list documents" }, { status: 500 });
  }
}

const createSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  content: z.string().max(500_000).optional(),
});

export async function POST(request: NextRequest) {
  const user = await requireAuth();
  if (isErrorResponse(user)) return user;

  try {
    const body = await request.json();
    const { title, content } = createSchema.parse(body);
    const id = await createDocument(
      user.uid,
      sanitizeInput(title ?? "Untitled Document", 200),
      content ?? ""
    );
    return NextResponse.json({ id }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create document" }, { status: 500 });
  }
}
