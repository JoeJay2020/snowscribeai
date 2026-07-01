import mammoth from "mammoth";
import { PDFParse } from "pdf-parse";

const MAX_PARSED_CHARS = 12_000;

export interface IncomingAttachment {
  name: string;
  mimeType?: string;
  content: string; // base64
}

export interface ParsedAttachment {
  name: string;
  content: string;
  mimeType: string;
}

function getExtension(name: string): string {
  const dot = name.lastIndexOf(".");
  if (dot < 0) return "";
  return name.slice(dot + 1).toLowerCase();
}

function decodeBase64(content: string): Buffer {
  return Buffer.from(content, "base64");
}

export async function parseAttachment(
  attachment: IncomingAttachment
): Promise<ParsedAttachment> {
  const ext = getExtension(attachment.name);
  const mimeType = attachment.mimeType?.toLowerCase() ?? "";
  const buffer = decodeBase64(attachment.content);

  let parsed = "";

  if (ext === "pdf" || mimeType.includes("pdf")) {
    const parser = new PDFParse({ data: buffer });
    try {
      const output = await parser.getText();
      parsed = output.text ?? "";
    } finally {
      await parser.destroy();
    }
  } else if (
    ext === "docx" ||
    mimeType.includes(
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    )
  ) {
    const output = await mammoth.extractRawText({ buffer });
    parsed = output.value ?? "";
  } else {
    // Fallback to text/utf-8 for plain text-like files
    parsed = buffer.toString("utf8");
  }

  return {
    name: attachment.name,
    mimeType: attachment.mimeType ?? "text/plain",
    content: parsed.replace(/\u0000/g, "").slice(0, MAX_PARSED_CHARS).trim(),
  };
}
