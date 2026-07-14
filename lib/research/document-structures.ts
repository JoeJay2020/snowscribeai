/**
 * Document-structure instructions for proposals, literature reviews, and methodology.
 */

import type { ResearchIntent } from "./types";

export function buildProposalStructureInstructions(intent: ResearchIntent): string {
  const variables =
    intent.keyVariables.length > 0
      ? intent.keyVariables.join("; ")
      : intent.researchTopic;

  return `RESEARCH PROPOSAL STRUCTURE (GENERATE FULL DOCUMENT):
Produce a complete, professionally structured research proposal with these sections:

Front Matter
- Title Page
- Declaration (optional placeholder)
- Approval (optional placeholder)
- Dedication
- Acknowledgements
- Abstract (≈250–350 words)
- Table of Contents (outlined)
- List of Tables
- List of Figures
- List of Abbreviations

Chapter One — Introduction
- Introduction
- Background to the Study
- Problem Statement
- Research Aim
- Research Objectives (general + specific)
- Research Questions
- Hypotheses (where applicable to ${intent.discipline})
- Significance of the Study
- Scope of the Study
- Limitations
- Delimitations
- Assumptions
- Definition of Key Terms
- Chapter Summary

Chapter Two — Literature Review
- Introduction
- Conceptualisation of Key Variables (${variables})
- Theoretical Framework
  - Explain each selected theory
  - Justify each theory
  - Strengths and weaknesses
  - Relevance to this study
  - Include a theory diagram in Markdown/ASCII where appropriate
- Literature Review organised by EACH research objective

CRITICAL LITERATURE RULE:
If an objective addresses an industry-specific relationship (e.g. "Effect of Outsourcing Services on Performance of Construction Companies"),
do NOT confine the literature review only to construction companies.
First review the broader relationship (e.g. effect of outsourcing on business/organisational performance) across industries,
then narrow to construction / the focal sector when discussing empirical evidence and contextualisation
${intent.geographicalFocus ? `(especially ${intent.geographicalFocus})` : ""}.

After reviewing literature for each objective:
- Conceptual Framework (professional diagram in Markdown/ASCII + explanation)
- Empirical Literature Review — for EVERY key study include where possible:
  Author, Year, Country, Purpose, Methodology, Sample, Data collection, Analysis, Key findings.
  Critically compare findings; highlight agreements and contradictions; link findings to theories.
- Research Gap — clearly identify methodological, geographical, contextual, theoretical, knowledge, and practical gaps.
  Conclude with how THIS study addresses those gaps.
- Chapter Summary

Chapter Three — Research Methodology (WHAT / WHY / HOW for every choice)
- Research Philosophy
- Research Approach
- Research Design
- Population
- Sampling / Sample Size / Sampling Technique
- Research Instruments
- Pilot Study
- Validity
- Reliability
- Ethical Considerations
- Data Collection
- Data Analysis
- Chapter Summary

Also include Timeline (Gantt-style markdown table), Budget Estimate (table), and a full APA 7th References list of REAL sources only.`;
}

export function buildLiteratureStructureInstructions(intent: ResearchIntent): string {
  return `LITERATURE REVIEW STRUCTURE:
Topic: ${intent.researchTopic}
Discipline: ${intent.discipline}
${intent.geographicalFocus ? `Geographic focus: ${intent.geographicalFocus}` : ""}

1. Introduction (scope, purpose, search strategy)
2. Conceptualisation of key constructs
3. Theoretical perspectives relevant to the topic
4. Thematic synthesis organised around key themes / objectives — CRITICAL ANALYSIS, not sequential summaries
5. Empirical synthesis with comparison of methods and findings across contexts
6. Research gaps (methodological, geographical, contextual, theoretical, knowledge, practical)
7. Conceptual / theoretical implications
8. Conclusion
9. APA 7th reference list of real, preferentially recent (2021–2025) scholarly sources

Synthesise debates. Show evolution of thought. Do not produce annotated bibliography-style isolated summaries.`;
}

export function buildMethodologyStructureInstructions(intent: ResearchIntent): string {
  return `METHODOLOGY DEPTH REQUIREMENT:
For every subsection (philosophy, approach, design, population, sampling, instruments, pilot, validity, reliability, ethics, collection, analysis):
1) Define it clearly.
2) Support with real scholars and real citations.
3) Explain WHY it suits this study (${intent.researchTopic}).
4) Explain HOW it will be operationalised in practice.
Never invent instrument psychometric properties; if unsure, state that values will be established through pilot testing.`;
}

export function buildDissertationChapterInstructions(intent: ResearchIntent): string {
  return `DISSERTATION CHAPTER STANDARD:
Write as a submission-ready chapter draft suitable for ${intent.academicLevel === "Unknown" ? "Masters/PhD" : intent.academicLevel} examination.
Maintain numbering, headings, transitions, and scholarly voice throughout.
Include a brief chapter summary and APA references for works cited.
If this is Chapter Two, apply literature synthesis and anti-fabrication rules fully.
If this is Chapter Three, apply WHAT/WHY/HOW methodology rules fully.
If this is Chapter One, include full introduction scaffolding (background through definitions).`;
}
