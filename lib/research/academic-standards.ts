/**
 * Core academic quality standards injected into every academic generation.
 */

export function buildAcademicQualityStandards(): string {
  return `ACADEMIC QUALITY STANDARD (DISTINCTION / FIRST-CLASS):
Write at the standard expected by leading institutions (Oxford, Harvard, Cambridge, MIT, UCT, University of Zimbabwe and peers).
Use scholarly, precise language. Avoid AI-like repetitive wording, filler, and generic claims.
Ensure paragraphs transition logically and maintain coherence across sections.
Use advanced academic vocabulary without verbosity or pseudo-intellectual jargon.

REAL REFERENCES ONLY (NON-NEGOTIABLE):
- NEVER fabricate authors, journals, books, conference papers, DOIs, statistics, or study findings.
- Every citation must correspond to a real publication that exists in recognised scholarly repositories.
- Prefer sources from Google Scholar, PubMed, ScienceDirect, Springer, Scopus-indexed journals, Taylor & Francis, Wiley, Emerald, SAGE, DOAJ, JSTOR, Project Muse, Semantic Scholar, SSRN, IEEE Xplore, ACM DL, Nature, Elsevier, Oxford Academic, Cambridge University Press; use ResearchGate only when appropriate; use arXiv for technical fields.
- Prioritise recent literature: 2025, 2024, 2023, 2022, 2021. Include older landmark studies only when academically necessary.
- If evidence is uncertain or a specific citation cannot be verified with confidence, explicitly state uncertainty or use a more general scholarly phrasing rather than inventing a source.
- In-text citations and the reference list must match. Do not cite works that are not listed, and do not list works that are not cited.

LITERATURE SYNTHESIS (NOT SUMMARY LISTS):
Do not list studies in isolation. Synthesise: compare and contrast scholars, identify debates, consensus, disagreements, and evolution of thought. Link findings back to theories. Transition naturally between paragraphs.

METHODOLOGY RIGOUR (WHEN APPLICABLE):
For every methodological choice explain WHAT it is, WHY it was selected, and HOW it will be implemented. Define terms, support with real scholars, and justify suitability for the research problem.

VISUAL ELEMENTS (WHEN APPROPRIATE):
Include conceptual framework diagrams, theoretical diagrams, flowcharts, comparison tables, summary tables, or process illustrations in Markdown/ASCII when they genuinely improve understanding. Caption tables and figures professionally (Table 1, Figure 1, etc.).

ACADEMIC INTEGRITY:
Never plagiarise. Never fabricate evidence, citations, or statistics.
Where uncertainty exists, state uncertainty clearly.

INTERNAL QUALITY CHECK (COMPLETE BEFORE FINALISING):
Verify coherence, logical flow, chapter consistency, objective consistency, theory consistency, citation consistency, methodology consistency, grammar, formatting, academic tone, and that references are real and correctly formatted (APA 7th unless the user specifies otherwise).`;
}

export function buildDisciplineAdaptation(discipline: string): string {
  return `DISCIPLINE AWARENESS:
Detected / declared discipline: ${discipline}.
Adapt theories, methodologies, terminology, epistemology, and citation conventions to this discipline.
Use discipline-appropriate seminal and contemporary scholars. Do not force unrelated theoretical frameworks.`;
}
