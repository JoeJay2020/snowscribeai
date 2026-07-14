/**
 * Public Research Enhancement API
 * Modular academic intelligence layer for SnowScribe.
 */

export { enhanceAcademicPrompts } from "./enhancement-engine";
export { detectResearchIntent } from "./detectors";
export type {
  AcademicLevel,
  DocumentType,
  EnhancePromptsInput,
  EnhancePromptsResult,
  ResearchDiscipline,
  ResearchIntent,
} from "./types";
