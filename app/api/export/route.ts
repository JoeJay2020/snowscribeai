import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth, isErrorResponse } from "@/lib/api/auth";
import { generateDocx, generatePdf, generateMarkdown } from "@/lib/export/generators";
import { rateLimit, getClientIp, sanitizeInput } from "@/lib/security";

const exportSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1).max(500_000),
  format: z.enum(["pdf", "docx", "markdown"]),
});

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const limit = rateLimit(`export:${ip}`, 20, 60_000);
  if (!limit.success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const user = await requireAuth();
  if (isErrorResponse(user)) return user;

  try {
    const body = await request.json();
    const { title, content, format } = exportSchema.parse(body);
    const safeTitle = sanitizeInput(title, 200);
    const safeContent = sanitizeInput(content, 500_000);

    let buffer: Buffer;
    let contentType: string;
    let filename: string;

    switch (format) {
      case "docx":
        buffer = await generateDocx(safeTitle, safeContent);
        contentType =
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
        filename = `${safeTitle.replace(/[^a-z0-9]/gi, "_")}.docx`;
        break;
      case "pdf":
        buffer = await generatePdf(safeTitle, safeContent);
        contentType = "application/pdf";
        filename = `${safeTitle.replace(/[^a-z0-9]/gi, "_")}.pdf`;
        break;
      case "markdown":
        buffer = generateMarkdown(safeTitle, safeContent);
        contentType = "text/markdown";
        filename = `${safeTitle.replace(/[^a-z0-9]/gi, "_")}.md`;
        break;
    }

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    console.error("Export error:", error);
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}
