/**
 * Research Enhancement Engine — shared types.
 * Detected metadata used to silently enrich prompts before LLM calls.
 */

export type DocumentType =
  | "research-proposal"
  | "literature-review"
  | "dissertation-chapter"
  | "methodology"
  | "academic-section"
  | "writing-assist"
  | "assistant-chat"
  | "general-academic";

export type AcademicLevel =
  | "Undergraduate"
  | "Masters"
  | "PhD"
  | "Professional"
  | "Unknown";

export type ResearchDiscipline =
  | "Business"
  | "Economics"
  | "Finance"
  | "Accounting"
  | "Marketing"
  | "Education"
  | "Medicine"
  | "Nursing"
  | "Public Health"
  | "Computer Science"
  | "Artificial Intelligence"
  | "Engineering"
  | "Construction"
  | "Law"
  | "Agriculture"
  | "Psychology"
  | "Political Science"
  | "Development Studies"
  | "Sociology"
  | "Environmental Science"
  | "Supply Chain"
  | "Human Resources"
  | "Hospitality"
  | "Tourism"
  | "General Academic";

export interface ResearchIntent {
  documentType: DocumentType;
  discipline: ResearchDiscipline;
  academicLevel: AcademicLevel;
  researchTopic: string;
  geographicalFocus: string | null;
  keyVariables: string[];
  isProposalRequest: boolean;
  isLiteratureHeavy: boolean;
  isMethodologyHeavy: boolean;
}

export interface EnhancePromptsInput {
  toolId: string;
  inputs: Record<string, string>;
  systemPrompt: string;
  userPrompt: string;
}

export interface EnhancePromptsResult {
  systemPrompt: string;
  userPrompt: string;
  intent: ResearchIntent;
}
