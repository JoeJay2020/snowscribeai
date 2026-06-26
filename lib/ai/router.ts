import { getAdminDb } from "@/lib/firebase/admin";
import { DEFAULT_MODELS } from "./models";
import { resolveTaskTier } from "./classifier";
import { callOpenRouter, calculateCost } from "./openrouter";
import type { ModelConfig, AIRouterResult } from "@/types/ai";
import type { OpenRouterMessage } from "./openrouter";

export async function getModelsForTier(tier: ModelConfig["tier"]): Promise<ModelConfig[]> {
  try {
    const db = getAdminDb();
    const snapshot = await db
      .collection("modelConfigs")
      .where("tier", "==", tier)
      .where("enabled", "==", true)
      .orderBy("priority")
      .get();

    if (!snapshot.empty) {
      return snapshot.docs.map((doc) => doc.data() as ModelConfig);
    }
  } catch {
    // Fall through to defaults if Firestore query fails or collection empty
  }

  return DEFAULT_MODELS.filter((m) => m.tier === tier && m.enabled).sort(
    (a, b) => a.priority - b.priority
  );
}

export async function routeAndGenerate(
  toolId: string,
  inputs: Record<string, string>,
  systemPrompt: string,
  userPrompt: string
): Promise<AIRouterResult> {
  const tier = resolveTaskTier(toolId, inputs);
  const models = await getModelsForTier(tier);

  if (models.length === 0) {
    throw new Error(`No models available for tier: ${tier}`);
  }

  const messages: OpenRouterMessage[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
  ];

  let lastError: Error | null = null;

  for (let i = 0; i < models.length; i++) {
    const model = models[i];
    try {
      const response = await callOpenRouter(model, messages);
      const content = response.choices[0]?.message?.content ?? "";
      const tokensIn = response.usage.prompt_tokens;
      const tokensOut = response.usage.completion_tokens;

      return {
        content,
        modelUsed: response.model,
        tier,
        tokensIn,
        tokensOut,
        costUsd: calculateCost(model, tokensIn, tokensOut),
        attempts: i + 1,
      };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.error(`Model ${model.modelId} failed:`, lastError.message);
    }
  }

  throw lastError ?? new Error("All models failed");
}
