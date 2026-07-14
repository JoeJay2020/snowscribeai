import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  convertInchesToTwip,
} from "docx";

const BODY_FONT = "Times New Roman";
const BODY_SIZE = 24; // 12pt
const LINE_1_5 = 360; // 240 * 1.5

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
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 360, after: 200, line: LINE_1_5 },
          children: [
            new TextRun({
              text: trimmed.slice(2),
              bold: true,
              font: BODY_FONT,
              size: 28,
            }),
          ],
        })
      );
    } else if (trimmed.startsWith("## ")) {
      paragraphs.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 280, after: 160, line: LINE_1_5 },
          children: [
            new TextRun({
              text: trimmed.slice(3),
              bold: true,
              font: BODY_FONT,
              size: 26,
            }),
          ],
        })
      );
    } else if (trimmed.startsWith("### ")) {
      paragraphs.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 200, after: 120, line: LINE_1_5 },
          children: [
            new TextRun({
              text: trimmed.slice(4),
              bold: true,
              font: BODY_FONT,
              size: BODY_SIZE,
            }),
          ],
        })
      );
    } else if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      paragraphs.push(
        new Paragraph({
          bullet: { level: 0 },
          spacing: { after: 80, line: LINE_1_5 },
          children: parseInlineFormatting(trimmed.slice(2)),
        })
      );
    } else {
      paragraphs.push(
        new Paragraph({
          alignment: AlignmentType.BOTH,
          spacing: { after: 160, line: LINE_1_5 },
          children: parseInlineFormatting(trimmed),
        })
      );
    }
  }

  return paragraphs;
}

function parseInlineFormatting(text: string): TextRun[] {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return parts.map((part) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return new TextRun({
        text: part.slice(2, -2),
        bold: true,
        font: BODY_FONT,
        size: BODY_SIZE,
      });
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return new TextRun({
        text: part.slice(1, -1),
        italics: true,
        font: BODY_FONT,
        size: BODY_SIZE,
      });
    }
    return new TextRun({
      text: part,
      font: BODY_FONT,
      size: BODY_SIZE,
    });
  });
}

export async function generateDocx(
  title: string,
  content: string
): Promise<Buffer> {
  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            font: BODY_FONT,
            size: BODY_SIZE,
          },
          paragraph: {
            spacing: { line: LINE_1_5 },
            alignment: AlignmentType.BOTH,
          },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: convertInchesToTwip(1),
              bottom: convertInchesToTwip(1),
              left: convertInchesToTwip(1),
              right: convertInchesToTwip(1),
            },
          },
        },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 400, line: LINE_1_5 },
            children: [
              new TextRun({
                text: title,
                bold: true,
                font: BODY_FONT,
                size: 32,
              }),
            ],
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
    const doc = new PDFDocument({
      margin: 72,
      size: "A4",
      bufferPages: true,
    });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    // Times-Roman approximates academic Times New Roman on server runtimes
    doc.fontSize(16).font("Times-Bold").text(title, { align: "center" });
    doc.moveDown(1.5);

    const lines = content.split("\n");
    for (const line of lines) {
      const trimmed = line.trim();

      if (!trimmed) {
        doc.moveDown(0.5);
        continue;
      }

      if (trimmed.startsWith("# ")) {
        doc
          .moveDown(0.5)
          .fontSize(14)
          .font("Times-Bold")
          .text(trimmed.slice(2), { align: "left", lineGap: 4 });
        doc.moveDown(0.3);
      } else if (trimmed.startsWith("## ")) {
        doc
          .moveDown(0.4)
          .fontSize(13)
          .font("Times-Bold")
          .text(trimmed.slice(3), { align: "left", lineGap: 4 });
        doc.moveDown(0.2);
      } else if (trimmed.startsWith("### ")) {
        doc
          .moveDown(0.3)
          .fontSize(12)
          .font("Times-Bold")
          .text(trimmed.slice(4), { align: "left", lineGap: 3 });
        doc.moveDown(0.15);
      } else {
        doc.fontSize(12).font("Times-Roman").text(trimmed, {
          align: "justify",
          lineGap: 6,
        });
      }
    }

    const pageCount = doc.bufferedPageRange().count;
    for (let i = 0; i < pageCount; i++) {
      doc.switchToPage(i);
      doc
        .fontSize(10)
        .font("Times-Roman")
        .text(String(i + 1), 72, doc.page.height - 50, {
          align: "center",
          width: doc.page.width - 144,
        });
    }

    doc.end();
  });
}

export function generateMarkdown(title: string, content: string): Buffer {
  const md = `# ${title}\n\n${content}`;
  return Buffer.from(md, "utf-8");
}
