import { NextRequest, NextResponse } from "next/server";
import { requireAuth, isErrorResponse } from "@/lib/api/auth";
import { getThread, listMessages } from "@/lib/assistant/store";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const user = await requireAuth();
  if (isErrorResponse(user)) return user;

  try {
    const { id } = await params;
    const thread = await getThread(user.uid, id);
    if (!thread) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const messages = await listMessages(user.uid, id);
    return NextResponse.json({ thread, messages });
  } catch (error) {
    console.error("Get assistant thread error:", error);
    return NextResponse.json(
      { error: "Failed to load thread" },
      { status: 500 }
    );
  }
}
