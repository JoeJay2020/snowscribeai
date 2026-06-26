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
    systemPrompt: `You are an expert academic research advisor specializing in research proposal writing for African universities and international institutions. Write in formal academic English. Use proper APA-style in-text citations where relevant (Author, Year format). Structure output clearly with numbered sections and subsections.`,
    buildUserPrompt: (inputs) =>
      `Generate a complete research proposal for the following:

**Topic:** ${inputs.topic}
**Field of Study:** ${inputs.field}
**Degree Level:** ${inputs.degree}
${inputs.context ? `**Additional Context:** ${inputs.context}` : ""}

Include these sections:
1. Title Page (title, researcher placeholder, institution placeholder, date)
2. Abstract (250 words)
3. Introduction & Background
4. Problem Statement
5. Research Objectives (general and specific)
6. Research Questions
7. Significance of the Study
8. Literature Review Summary (key themes, not exhaustive)
9. Theoretical/Conceptual Framework
10. Research Methodology (design, population, sampling, data collection, analysis)
11. Ethical Considerations
12. Timeline (Gantt-style table in markdown)
13. Budget Estimate (table format)
14. References (at least 10 credible sources in APA format)

Make it comprehensive, academically rigorous, and appropriate for the ${inputs.degree} level.`,
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
    systemPrompt: `You are an expert academic literature reviewer. Write comprehensive, critical literature reviews that synthesize research thematically (not study-by-study). Use APA citation style. Identify gaps in the literature. Write in formal academic English suitable for thesis or journal submission.`,
    buildUserPrompt: (inputs) =>
      `Write a comprehensive literature review on:

**Topic:** ${inputs.topic}
**Field:** ${inputs.field}
**Scope:** ${inputs.scope}
${inputs.themes ? `**Key Themes:** ${inputs.themes}` : ""}

Structure:
1. Introduction (scope, purpose, search strategy description)
2. Thematic Section 1 (with critical analysis, not just description)
3. Thematic Section 2
4. Thematic Section 3
5. Thematic Section 4 (if applicable)
6. Summary & Synthesis
7. Research Gaps Identified (bullet list)
8. Conceptual Framework (describe relationships between key concepts)
9. References (15-20 credible academic sources in APA format)

Critically analyze studies — compare methodologies, findings, and limitations. Do not just summarize.`,
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
    systemPrompt: `You are an expert dissertation advisor and academic writer. Write at PhD/Masters level with formal academic tone. Use APA 7th edition citation style. Include appropriate transitions, topic sentences, and evidence-based arguments. Write comprehensive chapter content, not outlines.`,
    buildUserPrompt: (inputs) =>
      `Write the following dissertation chapter:

**Dissertation Title:** ${inputs.title}
**Chapter:** ${inputs.chapter}
**Field:** ${inputs.field}
**Research Context:** ${inputs.context}

Requirements:
- Write the FULL chapter content (3000-5000 words where appropriate)
- Use formal academic language
- Include proper section headings and subheadings
- Support arguments with citations (APA format)
- Include a brief chapter summary at the end
- Add a References section with relevant academic sources

Write as if this is a submission-ready draft that the student will refine.`,
  },
};
