import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth, isErrorResponse } from "@/lib/api/auth";
import {
  getDocument,
  updateDocument,
  deleteDocument,
} from "@/lib/documents/store";
import { sanitizeInput } from "@/lib/security";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const user = await requireAuth();
  if (isErrorResponse(user)) return user;

  const { id } = await params;
  const document = await getDocument(user.uid, id);
  if (!document) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ document });
}

const updateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  content: z.string().max(500_000).optional(),
});

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const user = await requireAuth();
  if (isErrorResponse(user)) return user;

  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = updateSchema.parse(body);

    const updates: { title?: string; content?: string } = {};
    if (parsed.title) updates.title = sanitizeInput(parsed.title, 200);
    if (parsed.content !== undefined) updates.content = sanitizeInput(parsed.content, 500_000);

    await updateDocument(user.uid, id, updates);
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    if (error instanceof Error && error.message === "Document not found") {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const user = await requireAuth();
  if (isErrorResponse(user)) return user;

  try {
    const { id } = await params;
    await deleteDocument(user.uid, id);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Delete failed" }, { status: 404 });
  }
}
