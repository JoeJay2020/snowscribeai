import type { ToolDefinition } from "./definitions";

const academicSystemPrompt = `You are an expert academic research advisor. Write in formal academic English suitable for thesis and dissertation work. Use APA citation style where references are needed. Be precise, rigorous, and structured.`;

export const ACADEMIC_TOOL_DEFINITIONS: Record<string, ToolDefinition> = {
  "abstract-generator": {
    id: "abstract-generator",
    name: "Abstract Generator",
    description: "Generate a structured academic abstract from your research summary.",
    creditCost: 10,
    fields: [
      {
        id: "title",
        label: "Paper/Thesis Title",
        placeholder: "Full title of your research",
        type: "text",
        required: true,
      },
      {
        id: "summary",
        label: "Research Summary",
        placeholder: "Briefly describe your research problem, methods, key findings, and conclusions...",
        type: "textarea",
        required: true,
      },
      {
        id: "style",
        label: "Citation Style",
        placeholder: "Select style",
        type: "select",
        required: true,
        options: ["APA", "Harvard", "IEEE", "Chicago"],
      },
    ],
    systemPrompt: academicSystemPrompt,
    buildUserPrompt: (inputs) =>
      `Write a structured academic abstract (200-300 words) for:

**Title:** ${inputs.title}
**Summary:** ${inputs.summary}
**Style context:** ${inputs.style}

Include: Background, Objective, Methods, Results, Conclusion. Write as a single cohesive abstract paragraph or structured abstract as appropriate.`,
  },

  "problem-statement": {
    id: "problem-statement",
    name: "Problem Statement Generator",
    description: "Craft a clear, compelling research problem statement.",
    creditCost: 10,
    fields: [
      {
        id: "topic",
        label: "Research Topic",
        placeholder: "Describe the broad area of research",
        type: "textarea",
        required: true,
      },
      {
        id: "context",
        label: "Context & Gap",
        placeholder: "What gap or issue have you identified?",
        type: "textarea",
        required: true,
      },
    ],
    systemPrompt: academicSystemPrompt,
    buildUserPrompt: (inputs) =>
      `Write a formal research problem statement for:

**Topic:** ${inputs.topic}
**Context & Gap:** ${inputs.context}

Include: (1) General problem, (2) Specific problem, (3) Evidence of the problem, (4) Consequences of not addressing it, (5) Knowledge gap. 300-500 words.`,
  },

  "research-questions": {
    id: "research-questions",
    name: "Research Questions Generator",
    description: "Generate aligned research questions from your objectives.",
    creditCost: 10,
    fields: [
      {
        id: "topic",
        label: "Research Topic",
        type: "text",
        placeholder: "Your research topic",
        required: true,
      },
      {
        id: "objectives",
        label: "Research Objectives",
        type: "textarea",
        placeholder: "List your general and specific objectives",
        required: true,
      },
    ],
    systemPrompt: academicSystemPrompt,
    buildUserPrompt: (inputs) =>
      `Generate research questions aligned with these objectives:

**Topic:** ${inputs.topic}
**Objectives:** ${inputs.objectives}

Provide: 1 main research question + 3-5 sub-questions. Explain how each question maps to an objective.`,
  },

  "research-objectives": {
    id: "research-objectives",
    name: "Research Objectives Generator",
    description: "Formulate general and specific research objectives.",
    creditCost: 10,
    fields: [
      {
        id: "topic",
        label: "Research Topic",
        type: "textarea",
        placeholder: "Describe your research topic and problem",
        required: true,
      },
      {
        id: "aim",
        label: "General Aim",
        type: "text",
        placeholder: "What do you aim to achieve?",
        required: true,
      },
    ],
    systemPrompt: academicSystemPrompt,
    buildUserPrompt: (inputs) =>
      `Formulate research objectives for:

**Topic:** ${inputs.topic}
**General Aim:** ${inputs.aim}

Provide: 1 general objective + 4-6 specific, measurable objectives using SMART criteria.`,
  },

  hypothesis: {
    id: "hypothesis",
    name: "Hypothesis Generator",
    description: "Generate testable null and alternative hypotheses.",
    creditCost: 10,
    fields: [
      {
        id: "topic",
        label: "Research Topic",
        type: "textarea",
        placeholder: "Describe variables and relationships",
        required: true,
      },
      {
        id: "design",
        label: "Research Design",
        type: "select",
        required: true,
        placeholder: "Select design",
        options: ["Quantitative", "Qualitative", "Mixed Methods"],
      },
    ],
    systemPrompt: academicSystemPrompt,
    buildUserPrompt: (inputs) =>
      `Generate hypotheses for a ${inputs.design} study on:

**Topic:** ${inputs.topic}

Provide: Null hypothesis (H0), Alternative hypothesis (H1), and brief rationale for each. If qualitative, provide research propositions instead.`,
  },

  methodology: {
    id: "methodology",
    name: "Methodology Generator",
    description: "Design a complete research methodology section.",
    creditCost: 20,
    fields: [
      {
        id: "topic",
        label: "Research Topic",
        type: "textarea",
        placeholder: "Your research topic and questions",
        required: true,
      },
      {
        id: "design",
        label: "Research Design",
        type: "select",
        required: true,
        placeholder: "Select",
        options: ["Quantitative", "Qualitative", "Mixed Methods", "Action Research", "Case Study"],
      },
      {
        id: "population",
        label: "Target Population",
        type: "text",
        placeholder: "e.g. University students in Harare, Zimbabwe",
        required: true,
      },
    ],
    systemPrompt: academicSystemPrompt,
    buildUserPrompt: (inputs) =>
      `Write a complete methodology section for:

**Topic:** ${inputs.topic}
**Design:** ${inputs.design}
**Population:** ${inputs.population}

Include: Research philosophy, Design justification, Population & sampling, Data collection instruments, Data analysis plan, Validity & reliability, Ethical considerations.`,
  },

  "research-gap": {
    id: "research-gap",
    name: "Research Gap Finder",
    description: "Identify gaps in existing literature for your topic.",
    creditCost: 20,
    fields: [
      {
        id: "topic",
        label: "Research Topic",
        type: "textarea",
        placeholder: "Your proposed research area",
        required: true,
      },
      {
        id: "field",
        label: "Academic Field",
        type: "text",
        placeholder: "e.g. Public Health, Education",
        required: true,
      },
    ],
    systemPrompt: academicSystemPrompt,
    buildUserPrompt: (inputs) =>
      `Identify research gaps in:

**Topic:** ${inputs.topic}
**Field:** ${inputs.field}

Provide: (1) Current state of knowledge, (2) 5-7 specific research gaps, (3) Why each gap matters, (4) Recommended research direction, (5) Potential contribution to the field.`,
  },

  "discussion-chapter": {
    id: "discussion-chapter",
    name: "Discussion Chapter Writer",
    description: "Draft a coherent discussion chapter from findings and theory.",
    creditCost: 30,
    fields: [
      {
        id: "topic",
        label: "Research Topic",
        type: "text",
        placeholder: "Your research topic",
        required: true,
      },
      {
        id: "keyFindings",
        label: "Key Findings",
        type: "textarea",
        placeholder: "Summarize your key findings/results",
        required: true,
      },
      {
        id: "theory",
        label: "Theoretical Framework",
        type: "textarea",
        placeholder: "What theory/framework should the discussion use?",
        required: true,
      },
    ],
    systemPrompt: academicSystemPrompt,
    buildUserPrompt: (inputs) =>
      `Write a dissertation discussion chapter draft.

Topic: ${inputs.topic}
Key Findings: ${inputs.keyFindings}
Theoretical Framework: ${inputs.theory}

Structure with headings: Introduction to discussion, interpretation of major findings, comparison with prior literature, theoretical implications, practical implications, limitations, transition to conclusion.`,
  },

  "conclusion-chapter": {
    id: "conclusion-chapter",
    name: "Conclusion Chapter Writer",
    description: "Generate a polished conclusion chapter with implications.",
    creditCost: 20,
    fields: [
      {
        id: "topic",
        label: "Research Topic",
        type: "text",
        placeholder: "Your topic",
        required: true,
      },
      {
        id: "summary",
        label: "Summary of Findings",
        type: "textarea",
        placeholder: "Summarize key findings and outcomes",
        required: true,
      },
      {
        id: "recommendations",
        label: "Preferred Recommendations Focus",
        type: "textarea",
        placeholder: "Policy, practice, future research, etc.",
        required: true,
      },
    ],
    systemPrompt: academicSystemPrompt,
    buildUserPrompt: (inputs) =>
      `Write a thesis/dissertation conclusion chapter draft.

Topic: ${inputs.topic}
Summary of Findings: ${inputs.summary}
Recommendations focus: ${inputs.recommendations}

Include: concise recap, overall contribution, recommendations, future research directions, and final concluding paragraph.`,
  },

  "data-analysis-plan": {
    id: "data-analysis-plan",
    name: "Data Analysis Plan Generator",
    description: "Build a clear analysis plan for quantitative, qualitative, or mixed studies.",
    creditCost: 20,
    fields: [
      {
        id: "studyDesign",
        label: "Study Design",
        type: "select",
        required: true,
        placeholder: "Select design",
        options: ["Quantitative", "Qualitative", "Mixed Methods"],
      },
      {
        id: "researchQuestions",
        label: "Research Questions",
        type: "textarea",
        placeholder: "List your research questions",
        required: true,
      },
      {
        id: "dataSources",
        label: "Data Sources",
        type: "textarea",
        placeholder: "Describe datasets/interviews/surveys and variables",
        required: true,
      },
    ],
    systemPrompt: academicSystemPrompt,
    buildUserPrompt: (inputs) =>
      `Create a complete data analysis plan for a ${inputs.studyDesign} study.

Research Questions: ${inputs.researchQuestions}
Data Sources: ${inputs.dataSources}

Provide: analysis objectives, preparation/cleaning steps, methods/techniques, software/tools, quality checks, and reporting structure.`,
  },
};
