import { TOOL_DEFINITIONS, type ToolDefinition } from "./definitions";
import { ACADEMIC_TOOL_DEFINITIONS } from "./academic-tools";
import { WRITING_TOOL_DEFINITIONS } from "./writing-tools";

export type { ToolDefinition, ToolField, ToolWorkspaceConfig } from "./definitions";
export { TOOL_DEFINITIONS, toToolWorkspaceConfig } from "./definitions";

const ALL_TOOLS: Record<string, ToolDefinition> = {
  ...TOOL_DEFINITIONS,
  ...ACADEMIC_TOOL_DEFINITIONS,
  ...WRITING_TOOL_DEFINITIONS,
};

export function getToolDefinition(toolId: string): ToolDefinition | null {
  return ALL_TOOLS[toolId] ?? null;
}

export function getAllTools(): ToolDefinition[] {
  return Object.values(ALL_TOOLS);
}

export function getToolsByCategory(): Record<string, ToolDefinition[]> {
  const flagshipIds = ["research-proposal", "literature-review", "dissertation"];

  return {
    flagship: flagshipIds.map((id) => ALL_TOOLS[id]).filter(Boolean),
    academic: Object.values(ACADEMIC_TOOL_DEFINITIONS),
    writing: Object.values(WRITING_TOOL_DEFINITIONS),
  };
}
