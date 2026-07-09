import type { PlanId } from "@/lib/constants";
import { getAdminDb } from "@/lib/firebase/admin";
import {
  AFFORDABLE_FALLBACK_MODELS,
  dedupeModels,
  getModelsForPlanAndTier,
  isValidModelConfig,
} from "./models";
import { resolveTaskTier } from "./classifier";
import { callOpenRouter, calculateCost } from "./openrouter";
import type { ModelConfig, AIRouterResult } from "@/types/ai";
import type { OpenRouterMessage } from "./openrouter";

export async function getModelsForTier(
  tier: ModelConfig["tier"],
  plan?: PlanId
): Promise<ModelConfig[]> {
  const defaults = dedupeModels([
    ...getModelsForPlanAndTier(tier, plan),
    ...AFFORDABLE_FALLBACK_MODELS,
  ]);

  try {
    const db = getAdminDb();
    const snapshot = await db
      .collection("modelConfigs")
      .where("tier", "==", tier)
      .where("enabled", "==", true)
      .orderBy("priority")
      .get();

    if (!snapshot.empty) {
      const configured = snapshot.docs
        .map((doc) => doc.data() as ModelConfig)
        .filter(isValidModelConfig);

      if (configured.length > 0) {
        return dedupeModels([...configured, ...defaults]);
      }
    }
  } catch {
    // Fall through to defaults if Firestore query fails or collection empty
  }

  return defaults;
}

export async function routeAndGenerate(
  toolId: string,
  inputs: Record<string, string>,
  systemPrompt: string,
  userPrompt: string,
  options?: { plan?: PlanId }
): Promise<AIRouterResult> {
  const tier = resolveTaskTier(toolId, inputs);
  const models = await getModelsForTier(tier, options?.plan);

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
      const tokensIn = response.usage?.prompt_tokens ?? 0;
      const tokensOut = response.usage?.completion_tokens ?? 0;

      if (!content.trim()) {
        throw new Error("AI returned empty content");
      }

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
