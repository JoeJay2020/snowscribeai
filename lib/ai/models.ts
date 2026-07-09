import type { ModelConfig } from "@/types/ai";
import type { PlanId } from "@/lib/constants";

export const DEFAULT_MODELS: ModelConfig[] = [
  {
    id: "deepseek-chat",
    provider: "openrouter",
    modelId: "deepseek/deepseek-chat",
    displayName: "DeepSeek Chat",
    tier: "simple",
    enabled: true,
    priority: 1,
    costPer1kInput: 0.00014,
    costPer1kOutput: 0.00028,
    maxTokens: 2048,
  },
  {
    id: "qwen-7b",
    provider: "openrouter",
    modelId: "qwen/qwen-2.5-7b-instruct",
    displayName: "Qwen 2.5 7B",
    tier: "simple",
    enabled: true,
    priority: 2,
    costPer1kInput: 0.00004,
    costPer1kOutput: 0.0001,
    maxTokens: 2048,
  },
  {
    id: "mistral-small",
    provider: "openrouter",
    modelId: "mistralai/mistral-small-3.1-24b-instruct",
    displayName: "Mistral Small",
    tier: "medium",
    enabled: true,
    priority: 1,
    costPer1kInput: 0.0001,
    costPer1kOutput: 0.0003,
    maxTokens: 3072,
  },
  {
    id: "llama-70b",
    provider: "openrouter",
    modelId: "meta-llama/llama-3.3-70b-instruct",
    displayName: "Llama 3.3 70B",
    tier: "medium",
    enabled: true,
    priority: 2,
    costPer1kInput: 0.00012,
    costPer1kOutput: 0.0003,
    maxTokens: 4096,
  },
  {
    id: "gemini-flash",
    provider: "openrouter",
    modelId: "google/gemini-2.0-flash-001",
    displayName: "Gemini 2.0 Flash",
    tier: "complex",
    enabled: true,
    priority: 1,
    costPer1kInput: 0.0001,
    costPer1kOutput: 0.0004,
    maxTokens: 4096,
  },
  {
    id: "deepseek-complex",
    provider: "openrouter",
    modelId: "deepseek/deepseek-chat",
    displayName: "DeepSeek Chat",
    tier: "complex",
    enabled: true,
    priority: 2,
    costPer1kInput: 0.00014,
    costPer1kOutput: 0.00028,
    maxTokens: 4096,
  },
  {
    id: "llama-complex",
    provider: "openrouter",
    modelId: "meta-llama/llama-3.3-70b-instruct",
    displayName: "Llama 3.3 70B",
    tier: "complex",
    enabled: true,
    priority: 3,
    costPer1kInput: 0.00012,
    costPer1kOutput: 0.0003,
    maxTokens: 4096,
  },
  {
    id: "claude-sonnet",
    provider: "openrouter",
    modelId: "anthropic/claude-sonnet-4",
    displayName: "Claude Sonnet",
    tier: "complex",
    enabled: true,
    priority: 10,
    costPer1kInput: 0.003,
    costPer1kOutput: 0.015,
    maxTokens: 4096,
  },
  {
    id: "gpt-4o",
    provider: "openrouter",
    modelId: "openai/gpt-4o",
    displayName: "GPT-4o",
    tier: "complex",
    enabled: true,
    priority: 11,
    costPer1kInput: 0.0025,
    costPer1kOutput: 0.01,
    maxTokens: 4096,
  },
  {
    id: "gemini-pro",
    provider: "openrouter",
    modelId: "google/gemini-2.5-pro-preview",
    displayName: "Gemini 2.5 Pro",
    tier: "complex",
    enabled: true,
    priority: 12,
    costPer1kInput: 0.00125,
    costPer1kOutput: 0.01,
    maxTokens: 4096,
  },
];

/** Affordable models used when premium models fail or for free-tier users. */
export const AFFORDABLE_FALLBACK_MODELS: ModelConfig[] = [
  DEFAULT_MODELS.find((m) => m.id === "deepseek-chat")!,
  DEFAULT_MODELS.find((m) => m.id === "mistral-small")!,
  DEFAULT_MODELS.find((m) => m.id === "llama-70b")!,
  DEFAULT_MODELS.find((m) => m.id === "qwen-7b")!,
];

export const TOOL_TIER_MAP: Record<string, "simple" | "medium" | "complex"> = {
  "research-proposal": "complex",
  "literature-review": "complex",
  dissertation: "complex",
  paraphrase: "simple",
  grammar: "simple",
  rewrite: "simple",
  summarize: "medium",
  "abstract-generator": "medium",
  "problem-statement": "medium",
  "research-questions": "simple",
  "research-objectives": "simple",
  hypothesis: "simple",
  methodology: "complex",
  "research-gap": "medium",
  "discussion-chapter": "complex",
  "conclusion-chapter": "medium",
  "data-analysis-plan": "complex",
  "assistant-chat": "medium",
};

const PAID_PLANS: PlanId[] = ["STUDENT", "PRO", "BUSINESS", "ENTERPRISE"];

export function isPaidPlan(plan: PlanId | undefined): boolean {
  return Boolean(plan && PAID_PLANS.includes(plan));
}

export function getDefaultModelsForTier(tier: ModelConfig["tier"]): ModelConfig[] {
  return DEFAULT_MODELS.filter((m) => m.tier === tier && m.enabled).sort(
    (a, b) => a.priority - b.priority
  );
}

export function getModelsForPlanAndTier(
  tier: ModelConfig["tier"],
  plan: PlanId | undefined
): ModelConfig[] {
  const tierModels = getDefaultModelsForTier(tier);

  if (isPaidPlan(plan)) {
    return tierModels;
  }

  // Free users: affordable models first, then any remaining tier models.
  const affordable = tierModels.filter((m) => m.priority < 10);
  const premium = tierModels.filter((m) => m.priority >= 10);
  return [...affordable, ...premium];
}

export function isValidModelConfig(model: unknown): model is ModelConfig {
  if (!model || typeof model !== "object") return false;
  const m = model as ModelConfig;
  return Boolean(
    m.modelId &&
      typeof m.modelId === "string" &&
      m.enabled !== false &&
      m.tier &&
      typeof m.priority === "number"
  );
}

export function dedupeModels(models: ModelConfig[]): ModelConfig[] {
  const seen = new Set<string>();
  const result: ModelConfig[] = [];
  for (const model of models) {
    if (seen.has(model.modelId)) continue;
    seen.add(model.modelId);
    result.push(model);
  }
  return result;
}
