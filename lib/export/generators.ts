import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
} from "docx";

function markdownToParagraphs(content: string): Paragraph[] {
  const lines = content.split("\n");
  const paragraphs: Paragraph[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      paragraphs.push(new Paragraph({ text: "" }));
      continue;
    }

    if (trimmed.startsWith("# ")) {
      paragraphs.push(
        new Paragraph({
          text: trimmed.slice(2),
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 240, after: 120 },
        })
      );
    } else if (trimmed.startsWith("## ")) {
      paragraphs.push(
        new Paragraph({
          text: trimmed.slice(3),
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100 },
        })
      );
    } else if (trimmed.startsWith("### ")) {
      paragraphs.push(
        new Paragraph({
          text: trimmed.slice(4),
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 160, after: 80 },
        })
      );
    } else if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      paragraphs.push(
        new Paragraph({
          text: trimmed.slice(2),
          bullet: { level: 0 },
        })
      );
    } else {
      const runs = parseInlineFormatting(trimmed);
      paragraphs.push(new Paragraph({ children: runs, spacing: { after: 120 } }));
    }
  }

  return paragraphs;
}

function parseInlineFormatting(text: string): TextRun[] {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return parts.map((part) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return new TextRun({ text: part.slice(2, -2), bold: true });
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return new TextRun({ text: part.slice(1, -1), italics: true });
    }
    return new TextRun({ text: part });
  });
}

export async function generateDocx(
  title: string,
  content: string
): Promise<Buffer> {
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            text: title,
            heading: HeadingLevel.TITLE,
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
          }),
          ...markdownToParagraphs(content),
        ],
      },
    ],
  });

  return Packer.toBuffer(doc);
}

export async function generatePdf(
  title: string,
  content: string
): Promise<Buffer> {
  const PDFDocument = (await import("pdfkit")).default;

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: "A4" });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    doc.fontSize(18).font("Helvetica-Bold").text(title, { align: "center" });
    doc.moveDown(1.5);

    const lines = content.split("\n");
    for (const line of lines) {
      const trimmed = line.trim();

      if (!trimmed) {
        doc.moveDown(0.5);
        continue;
      }

      if (trimmed.startsWith("# ")) {
        doc.moveDown(0.5).fontSize(16).font("Helvetica-Bold").text(trimmed.slice(2));
        doc.moveDown(0.3);
      } else if (trimmed.startsWith("## ")) {
        doc.moveDown(0.4).fontSize(14).font("Helvetica-Bold").text(trimmed.slice(3));
        doc.moveDown(0.2);
      } else if (trimmed.startsWith("### ")) {
        doc.moveDown(0.3).fontSize(12).font("Helvetica-Bold").text(trimmed.slice(4));
        doc.moveDown(0.15);
      } else {
        doc.fontSize(11).font("Helvetica").text(trimmed, {
          align: "left",
          lineGap: 2,
        });
      }
    }

    doc.end();
  });
}

export function generateMarkdown(title: string, content: string): Buffer {
  const md = `# ${title}\n\n${content}`;
  return Buffer.from(md, "utf-8");
}
