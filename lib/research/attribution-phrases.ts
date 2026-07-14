/**
 * Scholarly attribution phrases — injected as a rotation instruction.
 * Prevents repetitive "Author (Year) says that..." patterns.
 */

export const ATTRIBUTION_PHRASES = [
  "articulates that",
  "asserts that",
  "affirms that",
  "submits that",
  "contends that",
  "reiterates that",
  "postulates that",
  "maintains that",
  "argues that",
  "opines that",
  "is of the opinion that",
  "avows that",
  "emphasises that",
  "highlights that",
  "demonstrates that",
  "observes that",
  "notes that",
  "acknowledges that",
  "advances the view that",
  "underscores that",
  "posits that",
  "explains that",
  "reveals that",
  "establishes that",
  "elucidates that",
  "expounds that",
  "indicates that",
  "illustrates that",
  "corroborates that",
  "ascertains that",
  "suggests that",
] as const;

export function buildAttributionInstruction(): string {
  return `SCHOLARLY ATTRIBUTION STYLE:
Vary author attribution. Do not overuse "says that" or "states that".
Rotate naturally among phrases such as: ${ATTRIBUTION_PHRASES.join("; ")}.
Avoid repeating the same attribution phrase in consecutive paragraphs.
Prefer: "Smith (2024) contends that…" / "As Jones (2023) emphasises…" / "Brown and Lee (2025) establish that…".`;
}
