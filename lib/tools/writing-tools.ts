import type { ToolDefinition } from "./definitions";
import { CREDIT_COSTS } from "@/lib/constants";

const writingSystemPrompt = `You are an expert writing assistant. Improve clarity, grammar, and style while preserving the author's meaning and voice. Return only the revised text unless asked otherwise.`;

export const WRITING_TOOL_DEFINITIONS: Record<string, ToolDefinition> = {
  paraphrase: {
    id: "paraphrase",
    name: "Paraphrase Tool",
    description: "Rewrite text in different words while keeping the same meaning.",
    creditCost: CREDIT_COSTS.PARAPHRASE,
    fields: [
      {
        id: "text",
        label: "Text to Paraphrase",
        placeholder: "Paste the text you want to paraphrase...",
        type: "textarea",
        required: true,
      },
      {
        id: "tone",
        label: "Tone",
        type: "select",
        required: true,
        placeholder: "Select tone",
        options: ["Academic", "Professional", "Simple", "Formal"],
      },
    ],
    systemPrompt: writingSystemPrompt,
    buildUserPrompt: (inputs) =>
      `Paraphrase the following text in a ${inputs.tone.toLowerCase()} tone. Maintain all key information and meaning:\n\n${inputs.text}`,
  },

  grammar: {
    id: "grammar",
    name: "Grammar Checker",
    description: "Fix grammar, spelling, and punctuation errors.",
    creditCost: CREDIT_COSTS.GRAMMAR_CHECK,
    fields: [
      {
        id: "text",
        label: "Text to Check",
        placeholder: "Paste your text here...",
        type: "textarea",
        required: true,
      },
    ],
    systemPrompt: writingSystemPrompt,
    buildUserPrompt: (inputs) =>
      `Correct all grammar, spelling, and punctuation errors in this text. Return the corrected text followed by a brief list of key changes made:\n\n${inputs.text}`,
  },

  summarize: {
    id: "summarize",
    name: "Text Summarizer",
    description: "Condense long text into a clear, concise summary.",
    creditCost: CREDIT_COSTS.SUMMARIZE,
    fields: [
      {
        id: "text",
        label: "Text to Summarize",
        placeholder: "Paste the text or article...",
        type: "textarea",
        required: true,
      },
      {
        id: "length",
        label: "Summary Length",
        type: "select",
        required: true,
        placeholder: "Select length",
        options: ["Brief (1 paragraph)", "Medium (3 paragraphs)", "Detailed (5+ paragraphs)"],
      },
    ],
    systemPrompt: writingSystemPrompt,
    buildUserPrompt: (inputs) =>
      `Summarize the following text. Target length: ${inputs.length}:\n\n${inputs.text}`,
  },

  rewrite: {
    id: "rewrite",
    name: "Sentence Rewriter",
    description: "Improve clarity and flow of sentences and paragraphs.",
    creditCost: CREDIT_COSTS.BASIC_REWRITE,
    fields: [
      {
        id: "text",
        label: "Text to Rewrite",
        placeholder: "Paste text to improve...",
        type: "textarea",
        required: true,
      },
    ],
    systemPrompt: writingSystemPrompt,
    buildUserPrompt: (inputs) =>
      `Rewrite the following text to improve clarity, flow, and readability while preserving meaning:\n\n${inputs.text}`,
  },
};
