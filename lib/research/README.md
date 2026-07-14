# Research Enhancement Engine

Silent academic intelligence layer for SnowScribe.

## Purpose

Users type natural requests. Before any LLM call, this engine enriches system and user prompts with:

- Discipline detection
- Academic level detection
- Document-type detection
- Distinction-level writing standards
- Real-reference-only rules
- Proposal / literature / methodology structures
- Scholarly attribution phrase rotation

The enhanced prompt is **never shown** to the user.

## Pipeline

```
User Input
  → Research Intent Detection
  → Discipline / Level / Document Type Detection
  → Academic Enhancement Prompt
  → LLM (via existing routeAndGenerate)
  → Final polished document (user-visible)
```

## Injection point

`lib/ai/router.ts` → `routeAndGenerate()` calls `enhanceAcademicPrompts()` immediately before building OpenRouter messages.

This covers:

- `/api/ai/generate` (all tools)
- `/api/assistant/chat`

API contracts are unchanged.

## Modules

| File | Role |
|------|------|
| `types.ts` | Shared types |
| `detectors.ts` | Intent / discipline / level / topic heuristics |
| `academic-standards.ts` | Quality + citation integrity rules |
| `attribution-phrases.ts` | Scholarly attribution rotation |
| `document-structures.ts` | Proposal / LR / methodology scaffolds |
| `enhancement-engine.ts` | Orchestrator |
| `index.ts` | Public exports |

## Design constraints

- No extra LLM hop for enhancement (zero added latency cost from a second model call)
- No changes to auth, billing, or response shapes
- Writing-assist tools receive lighter enrichment only
