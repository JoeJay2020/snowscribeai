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

export class OpenRouterError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code?: string,
    readonly suggestedMaxTokens?: number
  ) {
    super(message);
    this.name = "OpenRouterError";
  }
}

const REQUEST_TIMEOUT_MS = 55_000;
const MIN_MAX_TOKENS = 512;

function parseOpenRouterError(status: number, body: string): OpenRouterError {
  try {
    const parsed = JSON.parse(body) as {
      error?: { message?: string; code?: number | string };
    };
    const message = parsed.error?.message ?? body;
    const code = String(parsed.error?.code ?? status);

    const affordMatch = message.match(/can only afford (\d+)/i);
    const suggestedMaxTokens = affordMatch
      ? Math.max(MIN_MAX_TOKENS, Number(affordMatch[1]) - 64)
      : undefined;

    return new OpenRouterError(message, status, code, suggestedMaxTokens);
  } catch {
    return new OpenRouterError(body || `OpenRouter error (${status})`, status);
  }
}

export async function probeOpenRouter(): Promise<void> {
  const apiKey = serverEnv.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is missing");
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
      model: "deepseek/deepseek-chat",
      messages: [{ role: "user", content: "Reply with OK" }],
      max_tokens: 8,
    }),
    signal: AbortSignal.timeout(15_000),
  });

  if (!response.ok) {
    const body = await response.text();
    throw parseOpenRouterError(response.status, body);
  }

  const data = (await response.json()) as OpenRouterResponse;
  if (!data.choices?.[0]?.message?.content?.trim()) {
    throw new Error("OpenRouter probe returned empty content");
  }
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

  const initialMaxTokens = Math.min(
    maxTokens ?? model.maxTokens,
    model.maxTokens
  );

  let attemptMaxTokens = initialMaxTokens;
  let lastError: OpenRouterError | null = null;

  for (let attempt = 0; attempt < 3; attempt++) {
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
        max_tokens: attemptMaxTokens,
        temperature: 0.7,
      }),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });

    if (response.ok) {
      return response.json();
    }

    const errorBody = await response.text();
    const parsed = parseOpenRouterError(response.status, errorBody);
    lastError = parsed;

    const shouldRetryWithLowerTokens =
      response.status === 402 &&
      parsed.suggestedMaxTokens &&
      parsed.suggestedMaxTokens < attemptMaxTokens;

    if (shouldRetryWithLowerTokens) {
      attemptMaxTokens = parsed.suggestedMaxTokens;
      continue;
    }

    throw parsed;
  }

  throw lastError ?? new Error("OpenRouter request failed");
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

export function getUserFacingAiError(error: unknown): string {
  if (error instanceof OpenRouterError) {
    if (error.status === 401) {
      return "AI service authentication failed. Check OPENROUTER_API_KEY on the server.";
    }
    if (error.status === 402) {
      return "AI provider credits are low. Using efficient models — please try again in a moment.";
    }
    if (error.status === 429) {
      return "AI service is busy. Please wait a few seconds and try again.";
    }
    if (error.message.toLowerCase().includes("timeout")) {
      return "Generation timed out. Try again with shorter inputs.";
    }
  }

  if (error instanceof Error) {
    if (error.name === "TimeoutError" || error.message.includes("timeout")) {
      return "Generation timed out. Try again with shorter inputs.";
    }
    if (error.message.includes("empty content")) {
      return "AI returned an empty response. Please try again.";
    }
  }

  return "Generation failed. Please try again.";
}
