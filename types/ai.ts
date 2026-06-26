export type TaskTier = "simple" | "medium" | "complex";

export interface ModelConfig {
  id: string;
  provider: "openrouter";
  modelId: string;
  displayName: string;
  tier: TaskTier;
  enabled: boolean;
  priority: number;
  costPer1kInput: number;
  costPer1kOutput: number;
  maxTokens: number;
}

export interface AIRouterResult {
  content: string;
  modelUsed: string;
  tier: TaskTier;
  tokensIn: number;
  tokensOut: number;
  costUsd: number;
  attempts: number;
}

export interface AIGenerateRequest {
  toolId: string;
  inputs: Record<string, string>;
}

export interface AIGenerateResponse {
  content: string;
  creditsUsed: number;
  modelUsed: string;
  requestId: string;
}
