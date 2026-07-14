/**
 * Research intent detectors — topic, discipline, level, document type.
 * Heuristic only (no extra LLM call) to keep latency and cost low.
 */

import type {
  AcademicLevel,
  DocumentType,
  ResearchDiscipline,
  ResearchIntent,
} from "./types";

const DISCIPLINE_KEYWORDS: Array<{
  discipline: ResearchDiscipline;
  keywords: string[];
}> = [
  { discipline: "Construction", keywords: ["construction", "building project", "contractor", "civil engineering", "quantity survey"] },
  { discipline: "Supply Chain", keywords: ["supply chain", "logistics", "procurement", "inventory", "outsourcing"] },
  { discipline: "Human Resources", keywords: ["human resource", "hr practices", "employee", "workforce", "talent management", "staff retention"] },
  { discipline: "Accounting", keywords: ["accounting", "auditing", "financial reporting", "ifrs", "taxation"] },
  { discipline: "Finance", keywords: ["finance", "banking", "investment", "capital structure", "credit risk", "mobile money"] },
  { discipline: "Marketing", keywords: ["marketing", "branding", "consumer behaviour", "advertising", "digital marketing"] },
  { discipline: "Business", keywords: ["business performance", "sme", "entrepreneurship", "strategic management", "organisational performance", "organizational performance"] },
  { discipline: "Economics", keywords: ["economics", "macroeconomic", "microeconomic", "gdp", "trade", "poverty"] },
  { discipline: "Education", keywords: ["education", "teaching", "learning", "curriculum", "school", "pedagogy", "student"] },
  { discipline: "Medicine", keywords: ["medicine", "clinical", "disease", "patient", "diagnosis", "treatment"] },
  { discipline: "Nursing", keywords: ["nursing", "nurse", "midwifery", "patient care"] },
  { discipline: "Public Health", keywords: ["public health", "epidemiolog", "health system", "community health", "vaccination"] },
  { discipline: "Artificial Intelligence", keywords: ["artificial intelligence", "machine learning", "deep learning", "neural network", "nlp", "llm"] },
  { discipline: "Computer Science", keywords: ["computer science", "software", "algorithm", "cybersecurity", "database", "information system"] },
  { discipline: "Engineering", keywords: ["engineering", "mechanical", "electrical", "industrial engineering", "manufacturing"] },
  { discipline: "Law", keywords: ["law", "legal", "legislation", "jurisprudence", "constitutional", "litigation"] },
  { discipline: "Agriculture", keywords: ["agriculture", "farming", "crop", "livestock", "agribusiness", "food security"] },
  { discipline: "Psychology", keywords: ["psychology", "behavioural", "behavioral", "cognitive", "mental health", "personality"] },
  { discipline: "Political Science", keywords: ["political", "governance", "democracy", "policy", "election", "statecraft"] },
  { discipline: "Development Studies", keywords: ["development studies", "sustainable development", "ngo", "international development", "rural development"] },
  { discipline: "Sociology", keywords: ["sociology", "social structure", "gender", "inequality", "community"] },
  { discipline: "Environmental Science", keywords: ["environment", "climate", "sustainability", "ecology", "pollution", "biodiversity"] },
  { discipline: "Hospitality", keywords: ["hospitality", "hotel", "guest experience"] },
  { discipline: "Tourism", keywords: ["tourism", "tourist", "destination", "travel industry"] },
];

const TOOL_DOCUMENT_MAP: Record<string, DocumentType> = {
  "research-proposal": "research-proposal",
  "literature-review": "literature-review",
  dissertation: "dissertation-chapter",
  methodology: "methodology",
  "data-analysis-plan": "methodology",
  "abstract-generator": "academic-section",
  "problem-statement": "academic-section",
  "research-questions": "academic-section",
  "research-objectives": "academic-section",
  hypothesis: "academic-section",
  "research-gap": "academic-section",
  "discussion-chapter": "dissertation-chapter",
  "conclusion-chapter": "dissertation-chapter",
  paraphrase: "writing-assist",
  grammar: "writing-assist",
  summarize: "writing-assist",
  rewrite: "writing-assist",
  "assistant-chat": "assistant-chat",
};

const FIELD_DISCIPLINE_MAP: Array<{
  discipline: ResearchDiscipline;
  patterns: RegExp[];
}> = [
  { discipline: "Construction", patterns: [/construction/i, /civil eng/i] },
  { discipline: "Business", patterns: [/business/i, /management/i, /mba/i] },
  { discipline: "Economics", patterns: [/economics/i] },
  { discipline: "Finance", patterns: [/finance/i, /banking/i] },
  { discipline: "Accounting", patterns: [/accounting/i, /audit/i] },
  { discipline: "Marketing", patterns: [/marketing/i] },
  { discipline: "Education", patterns: [/education/i, /pedagogy/i] },
  { discipline: "Medicine", patterns: [/medicine/i, /medical/i] },
  { discipline: "Nursing", patterns: [/nursing/i] },
  { discipline: "Public Health", patterns: [/public health/i, /health science/i] },
  { discipline: "Computer Science", patterns: [/computer science/i, /information technology/i, /\bit\b/i] },
  { discipline: "Artificial Intelligence", patterns: [/artificial intelligence/i, /\bai\b/i, /machine learning/i] },
  { discipline: "Engineering", patterns: [/engineering/i] },
  { discipline: "Law", patterns: [/\blaw\b/i, /legal/i] },
  { discipline: "Agriculture", patterns: [/agriculture/i, /agri/i] },
  { discipline: "Psychology", patterns: [/psychology/i] },
  { discipline: "Political Science", patterns: [/political/i, /politics/i] },
  { discipline: "Development Studies", patterns: [/development studies/i, /development/i] },
  { discipline: "Sociology", patterns: [/sociology/i] },
  { discipline: "Environmental Science", patterns: [/environment/i] },
  { discipline: "Supply Chain", patterns: [/supply chain/i, /logistics/i, /procurement/i] },
  { discipline: "Human Resources", patterns: [/human resource/i, /\bhr\b/i] },
  { discipline: "Hospitality", patterns: [/hospitality/i] },
  { discipline: "Tourism", patterns: [/tourism/i] },
];

function collectCorpus(toolId: string, inputs: Record<string, string>): string {
  return [toolId, ...Object.values(inputs)].filter(Boolean).join(" ").toLowerCase();
}

export function detectDocumentType(toolId: string, inputs: Record<string, string>): DocumentType {
  if (TOOL_DOCUMENT_MAP[toolId]) return TOOL_DOCUMENT_MAP[toolId];

  const corpus = collectCorpus(toolId, inputs);
  if (/research proposal|write a proposal|proposal on/.test(corpus)) {
    return "research-proposal";
  }
  if (/literature review|review of literature/.test(corpus)) {
    return "literature-review";
  }
  if (/methodology|research design|sampling/.test(corpus)) {
    return "methodology";
  }
  if (/dissertation|thesis chapter|chapter one|chapter 1/.test(corpus)) {
    return "dissertation-chapter";
  }
  return "general-academic";
}

export function detectAcademicLevel(
  toolId: string,
  inputs: Record<string, string>
): AcademicLevel {
  const degree = (inputs.degree ?? inputs.level ?? "").trim();
  if (/undergrad/i.test(degree)) return "Undergraduate";
  if (/master|msc|ma\b|mba/i.test(degree)) return "Masters";
  if (/phd|doctoral|doctorate/i.test(degree)) return "PhD";
  if (/professional/i.test(degree)) return "Professional";

  const corpus = collectCorpus(toolId, inputs);
  if (/\bphd\b|doctoral|doctorate/.test(corpus)) return "PhD";
  if (/masters|master'?s|msc|mba/.test(corpus)) return "Masters";
  if (/undergraduate|bachelor|honours|honors/.test(corpus)) return "Undergraduate";
  if (toolId === "dissertation") return "Masters";
  return "Unknown";
}

export function detectDiscipline(
  toolId: string,
  inputs: Record<string, string>
): ResearchDiscipline {
  const field = (inputs.field ?? inputs.discipline ?? "").trim();
  if (field) {
    for (const entry of FIELD_DISCIPLINE_MAP) {
      if (entry.patterns.some((p) => p.test(field))) {
        return entry.discipline;
      }
    }
  }

  const corpus = collectCorpus(toolId, inputs);
  let best: ResearchDiscipline = "General Academic";
  let bestScore = 0;

  for (const entry of DISCIPLINE_KEYWORDS) {
    let score = 0;
    for (const keyword of entry.keywords) {
      if (corpus.includes(keyword.toLowerCase())) score += 1;
    }
    if (score > bestScore) {
      bestScore = score;
      best = entry.discipline;
    }
  }

  return best;
}

export function extractResearchTopic(inputs: Record<string, string>): string {
  return (
    inputs.topic?.trim() ||
    inputs.title?.trim() ||
    inputs.message?.trim()?.slice(0, 300) ||
    inputs.summary?.trim()?.slice(0, 300) ||
    inputs.context?.trim()?.slice(0, 300) ||
    "the stated research problem"
  );
}

export function extractGeographicalFocus(corpus: string): string | null {
  const geoPatterns = [
    /\bin zimbabwe\b/i,
    /\bin south africa\b/i,
    /\bin nigeria\b/i,
    /\bin kenya\b/i,
    /\bin ghana\b/i,
    /\bin uganda\b/i,
    /\bin botswana\b/i,
    /\bin malawi\b/i,
    /\bin zambia\b/i,
    /\bin tanzania\b/i,
    /\bin rwanda\b/i,
    /\bsub[- ]saharan africa\b/i,
    /\bin africa\b/i,
  ];
  for (const pattern of geoPatterns) {
    const match = corpus.match(pattern);
    if (match) return match[0].replace(/^in\s+/i, "").trim();
  }
  return null;
}

function extractKeyVariables(topic: string): string[] {
  const cleaned = topic
    .replace(/^(write|generate|create|develop|produce)\b.*?\bon\b/i, "")
    .replace(/\b(the effect|effects|impact|influence|role|relationship)\s+(of|between)\b/i, "")
    .trim();

  const ofOn = cleaned.match(/\b(.+?)\s+on\s+(.+)$/i);
  if (ofOn) {
    return [ofOn[1].trim(), ofOn[2].trim()].filter((v) => v.length > 2).slice(0, 4);
  }

  const andParts = cleaned
    .split(/\s+and\s+|\s+vs\.?\s+|\s+versus\s+/i)
    .map((p) => p.trim())
    .filter((p) => p.length > 3);
  if (andParts.length >= 2) return andParts.slice(0, 4);

  return cleaned ? [cleaned] : [];
}

export function detectResearchIntent(
  toolId: string,
  inputs: Record<string, string>
): ResearchIntent {
  const documentType = detectDocumentType(toolId, inputs);
  const discipline = detectDiscipline(toolId, inputs);
  const academicLevel = detectAcademicLevel(toolId, inputs);
  const researchTopic = extractResearchTopic(inputs);
  const corpus = collectCorpus(toolId, inputs);
  const geographicalFocus = extractGeographicalFocus(corpus);
  const keyVariables = extractKeyVariables(researchTopic);

  const isProposalRequest =
    documentType === "research-proposal" ||
    /research proposal|write a proposal/.test(corpus);

  const isLiteratureHeavy =
    documentType === "literature-review" ||
    documentType === "research-proposal" ||
    /literature|chapter\s*2|chapter two/.test(corpus);

  const isMethodologyHeavy =
    documentType === "methodology" ||
    documentType === "research-proposal" ||
    /methodology|chapter\s*3|chapter three/.test(corpus);

  return {
    documentType,
    discipline,
    academicLevel,
    researchTopic,
    geographicalFocus,
    keyVariables,
    isProposalRequest,
    isLiteratureHeavy,
    isMethodologyHeavy,
  };
}
