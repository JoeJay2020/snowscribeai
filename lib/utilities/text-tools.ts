export interface TextStats {
  characters: number;
  charactersNoSpaces: number;
  words: number;
  sentences: number;
  paragraphs: number;
  readingTimeMinutes: number;
  readabilityGrade: number;
  readabilityLabel: string;
}

export function analyzeText(text: string): TextStats {
  const trimmed = text.trim();
  const characters = trimmed.length;
  const charactersNoSpaces = trimmed.replace(/\s/g, "").length;
  const words = trimmed ? trimmed.split(/\s+/).filter(Boolean).length : 0;
  const sentences = trimmed
    ? trimmed.split(/[.!?]+/).filter((s) => s.trim().length > 0).length
    : 0;
  const paragraphs = trimmed
    ? trimmed.split(/\n\s*\n/).filter((p) => p.trim().length > 0).length
    : 0;
  const readingTimeMinutes = Math.max(1, Math.ceil(words / 200));
  const readabilityGrade = calculateFleschKincaid(trimmed, words, sentences);
  const readabilityLabel = getReadabilityLabel(readabilityGrade);

  return {
    characters,
    charactersNoSpaces,
    words,
    sentences,
    paragraphs,
    readingTimeMinutes,
    readabilityGrade,
    readabilityLabel,
  };
}

function calculateFleschKincaid(text: string, words: number, sentences: number): number {
  if (words === 0 || sentences === 0) return 0;
  const syllables = countSyllables(text);
  return Math.round(0.39 * (words / sentences) + 11.8 * (syllables / words) - 15.59);
}

function countSyllables(text: string): number {
  const wordList = text.toLowerCase().match(/[a-z]+/g) ?? [];
  return wordList.reduce((total, word) => {
    const count = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "")
      .replace(/^y/, "")
      .match(/[aeiouy]{1,2}/g);
    return total + (count?.length ?? 1);
  }, 0);
}

function getReadabilityLabel(grade: number): string {
  if (grade <= 6) return "Easy (Elementary)";
  if (grade <= 9) return "Moderate (High School)";
  if (grade <= 13) return "Difficult (College)";
  return "Very Difficult (Graduate)";
}

export function cleanText(text: string): string {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/\t/g, " ")
    .replace(/ +/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export type CaseType = "upper" | "lower" | "title" | "sentence";

export function convertCase(text: string, caseType: CaseType): string {
  switch (caseType) {
    case "upper":
      return text.toUpperCase();
    case "lower":
      return text.toLowerCase();
    case "title":
      return text.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
    case "sentence":
      return text.toLowerCase().replace(/(^\w|\.\s+\w)/g, (c) => c.toUpperCase());
    default:
      return text;
  }
}

export function keywordDensity(text: string, keyword: string): number {
  const words = text.toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length === 0) return 0;
  const count = words.filter((w) => w.includes(keyword.toLowerCase())).length;
  return Math.round((count / words.length) * 10000) / 100;
}

export interface CitationInput {
  authors: string;
  year: string;
  title: string;
  source?: string;
  url?: string;
  doi?: string;
}

export function formatAPA(citation: CitationInput): string {
  const authors = citation.authors.trim();
  const parts = [
    `${authors} (${citation.year}). ${citation.title}.`,
    citation.source,
    citation.doi ? `https://doi.org/${citation.doi}` : citation.url,
  ].filter(Boolean);
  return parts.join(" ");
}

export function formatHarvard(citation: CitationInput): string {
  return `${citation.authors} (${citation.year}) '${citation.title}'${citation.source ? `, ${citation.source}` : ""}${citation.url ? `, Available at: ${citation.url}` : ""} (Accessed: ${new Date().toLocaleDateString("en-GB")}).`;
}

export function formatIEEE(citation: CitationInput): string {
  return `[1] ${citation.authors}, "${citation.title}," ${citation.source ?? "Unpublished"}, ${citation.year}.`;
}

export function formatChicago(citation: CitationInput): string {
  return `${citation.authors}. "${citation.title}." ${citation.source ?? ""} (${citation.year})${citation.url ? `. ${citation.url}` : ""}.`;
}

export const UTILITY_TOOLS = [
  { id: "word-counter", name: "Word Counter", href: "/utilities/word-counter", description: "Count words, characters, and reading time" },
  { id: "text-cleaner", name: "Text Cleaner", href: "/utilities/text-cleaner", description: "Clean and normalize text formatting" },
  { id: "case-converter", name: "Case Converter", href: "/utilities/case-converter", description: "Convert text between cases" },
  { id: "citation-formatter", name: "Citation Formatter", href: "/utilities/citation-formatter", description: "Format references in APA, Harvard, IEEE, Chicago" },
] as const;
