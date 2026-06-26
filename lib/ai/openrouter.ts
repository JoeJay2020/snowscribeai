import { serverEnv } from "@/lib/env/server";
import type { ModelConfig } from "@/types/ai";

export interface OpenRouterMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface OpenRouterResponse {
  id: string;
  model: string;
  choices: Array<{
    message: { role: string; content: string };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export async function callOpenRouter(
  model: ModelConfig,
  messages: OpenRouterMessage[],
  maxTokens?: number
): Promise<OpenRouterResponse> {
  const apiKey = serverEnv.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OpenRouter API key not configured");
  }

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": serverEnv.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
      "X-Title": "SnowScribe.ai",
    },
    body: JSON.stringify({
      model: model.modelId,
      messages,
      max_tokens: maxTokens ?? model.maxTokens,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`OpenRouter error (${response.status}): ${errorBody}`);
  }

  return response.json();
}

export function calculateCost(
  model: ModelConfig,
  tokensIn: number,
  tokensOut: number
): number {
  return (
    (tokensIn / 1000) * model.costPer1kInput +
    (tokensOut / 1000) * model.costPer1kOutput
  );
}
