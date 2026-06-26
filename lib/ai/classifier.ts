import { TOOL_TIER_MAP } from "./models";
import type { TaskTier } from "@/types/ai";

export function classifyTask(toolId: string): TaskTier {
  return TOOL_TIER_MAP[toolId] ?? "medium";
}

export function estimateComplexity(inputs: Record<string, string>): TaskTier {
  const totalLength = Object.values(inputs).join("").length;
  if (totalLength > 3000) return "complex";
  if (totalLength > 800) return "medium";
  return "simple";
}

export function resolveTaskTier(
  toolId: string,
  inputs: Record<string, string>
): TaskTier {
  const toolTier = classifyTask(toolId);
  const inputTier = estimateComplexity(inputs);
  const tierOrder: TaskTier[] = ["simple", "medium", "complex"];
  const toolIdx = tierOrder.indexOf(toolTier);
  const inputIdx = tierOrder.indexOf(inputTier);
  return tierOrder[Math.max(toolIdx, inputIdx)];
}
