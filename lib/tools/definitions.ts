export interface ToolField {
  id: string;
  label: string;
  placeholder: string;
  type: "text" | "textarea" | "select";
  required: boolean;
  options?: string[];
}

export interface ToolDefinition {
  id: string;
  name: string;
  description: string;
  creditCost: number;
  fields: ToolField[];
  systemPrompt: string;
  buildUserPrompt: (inputs: Record<string, string>) => string;
}

/** Serializable subset safe to pass from Server Components to client UI. */
export type ToolWorkspaceConfig = Pick<
  ToolDefinition,
  "id" | "name" | "description" | "creditCost" | "fields"
>;

export function toToolWorkspaceConfig(tool: ToolDefinition): ToolWorkspaceConfig {
  return {
    id: tool.id,
    name: tool.name,
    description: tool.description,
    creditCost: tool.creditCost,
    fields: tool.fields,
  };
}

export const TOOL_DEFINITIONS: Record<string, ToolDefinition> = {
  "research-proposal": {
    id: "research-proposal",
    name: "Research Proposal Generator",
    description:
      "Generate a comprehensive research proposal with all essential academic sections.",
    creditCost: 25,
    fields: [
      {
        id: "topic",
        label: "Research Topic",
        placeholder: "e.g. Impact of mobile money on rural entrepreneurship in Zimbabwe",
        type: "textarea",
        required: true,
      },
      {
        id: "field",
        label: "Field of Study",
        placeholder: "e.g. Economics, Education, Public Health",
        type: "text",
        required: true,
      },
      {
        id: "degree",
        label: "Degree Level",
        placeholder: "Select degree level",
        type: "select",
        required: true,
        options: ["Undergraduate", "Masters", "PhD", "Professional"],
      },
      {
        id: "context",
        label: "Additional Context (optional)",
        placeholder: "Any specific requirements, target population, geographic focus...",
        type: "textarea",
        required: false,
      },
    ],
    systemPrompt: `You are an expert academic research advisor specializing in research proposal writing for African universities and international institutions (including University of Zimbabwe, UCT, and peers), as well as leading global universities. Write in formal academic English at Distinction / First Class standard. Use APA 7th edition. Structure output with clear Markdown headings. Never fabricate references.`,
    buildUserPrompt: (inputs) =>
      `Generate a complete research proposal for the following:

**Topic:** ${inputs.topic}
**Field of Study:** ${inputs.field}
**Degree Level:** ${inputs.degree}
${inputs.context ? `**Additional Context:** ${inputs.context}` : ""}

Deliver a full proposal with front matter, Chapter One (introduction scaffolding), Chapter Two (literature + theoretical/conceptual framework + research gaps), Chapter Three (methodology with WHAT/WHY/HOW), timeline, budget, and a real APA 7th reference list (prefer 2021–2025 sources).

Literature must synthesise broadly across related industries where appropriate, then contextualise to the focal sector/geography. Include conceptual framework diagram(s) in Markdown when helpful.`,
  },

  "literature-review": {
    id: "literature-review",
    name: "Literature Review Generator",
    description:
      "Synthesize academic literature into a structured thematic review.",
    creditCost: 50,
    fields: [
      {
        id: "topic",
        label: "Review Topic",
        placeholder: "e.g. Digital literacy interventions in African secondary schools",
        type: "textarea",
        required: true,
      },
      {
        id: "field",
        label: "Academic Field",
        placeholder: "e.g. Education Technology",
        type: "text",
        required: true,
      },
      {
        id: "scope",
        label: "Scope & Time Period",
        placeholder: "e.g. Studies from 2015-2025, focus on Sub-Saharan Africa",
        type: "text",
        required: true,
      },
      {
        id: "themes",
        label: "Key Themes to Cover (optional)",
        placeholder: "e.g. access barriers, teacher training, student outcomes",
        type: "textarea",
        required: false,
      },
    ],
    systemPrompt: `You are an expert academic literature reviewer. Write Distinction-level thematic literature reviews that synthesise (not list) scholarship. Use APA 7th. Identify methodological, geographical, contextual, theoretical, knowledge, and practical gaps. Never fabricate references.`,
    buildUserPrompt: (inputs) =>
      `Write a comprehensive literature review on:

**Topic:** ${inputs.topic}
**Field:** ${inputs.field}
**Scope:** ${inputs.scope}
${inputs.themes ? `**Key Themes:** ${inputs.themes}` : ""}

Structure:
1. Introduction (scope, purpose, search strategy description)
2. Conceptualisation of key constructs
3–6. Thematic synthesised sections with critical analysis, debates, and consensus
7. Empirical synthesis across contexts (Author, Year, Country, Method, Sample, Findings where possible)
8. Research Gaps (methodological, geographical, contextual, theoretical, knowledge, practical)
9. Conceptual framework description (+ Markdown diagram if helpful)
10. Conclusion
11. References (15–25 real scholarly sources in APA 7th; prefer 2021–2025)

Critically compare studies — do not produce annotated-bibliography style summaries.`,
  },

  dissertation: {
    id: "dissertation",
    name: "Dissertation Assistant",
    description:
      "Generate a complete dissertation chapter with academic rigor.",
    creditCost: 100,
    fields: [
      {
        id: "title",
        label: "Dissertation Title",
        placeholder: "Full dissertation title",
        type: "text",
        required: true,
      },
      {
        id: "chapter",
        label: "Chapter to Generate",
        placeholder: "Select chapter",
        type: "select",
        required: true,
        options: [
          "Chapter 1: Introduction",
          "Chapter 2: Literature Review",
          "Chapter 3: Methodology",
          "Chapter 4: Results/Findings",
          "Chapter 5: Discussion",
          "Chapter 6: Conclusion & Recommendations",
        ],
      },
      {
        id: "field",
        label: "Field of Study",
        placeholder: "e.g. Sociology, Business Administration",
        type: "text",
        required: true,
      },
      {
        id: "context",
        label: "Research Context & Key Points",
        placeholder: "Summarize your research focus, methodology, key findings, or arguments...",
        type: "textarea",
        required: true,
      },
    ],
    systemPrompt: `You are an expert dissertation advisor and academic writer. Write at Masters/PhD Distinction standard with formal scholarly tone. Use APA 7th. Include transitions, topic sentences, and evidence-based arguments. Never fabricate references. Write comprehensive chapter content, not outlines.`,
    buildUserPrompt: (inputs) =>
      `Write the following dissertation chapter:

**Dissertation Title:** ${inputs.title}
**Chapter:** ${inputs.chapter}
**Field:** ${inputs.field}
**Research Context:** ${inputs.context}

Requirements:
- Write the FULL chapter content (3000–5000 words where appropriate)
- Use formal academic language and varied scholarly attribution
- Include proper section headings and subheadings
- Support arguments with REAL citations (APA 7th); prefer 2021–2025 literature
- For Chapter 2: synthesise literature and identify research gaps explicitly
- For Chapter 3: explain WHAT/WHY/HOW for every methodological choice
- Include a brief chapter summary at the end
- Add a References section listing only works actually cited

Write as a submission-ready draft the candidate will refine.`,
  },
};
