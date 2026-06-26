import { getAdminDb } from "@/lib/firebase/admin";
import { serverEnv } from "@/lib/env/server";

export type ObservabilitySeverity = "info" | "warning" | "error" | "critical";

export interface ObservabilityEventInput {
  type: string;
  severity: ObservabilitySeverity;
  source: string;
  message: string;
  userId?: string | null;
  requestId?: string | null;
  metadata?: Record<string, unknown>;
}

function serializeError(error: unknown): Record<string, unknown> {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }
  return { raw: String(error) };
}

export async function logEvent(input: ObservabilityEventInput): Promise<string | null> {
  try {
    const db = getAdminDb();
    const now = new Date().toISOString();
    const ref = await db.collection("observabilityEvents").add({
      ...input,
      userId: input.userId ?? null,
      requestId: input.requestId ?? null,
      metadata: input.metadata ?? {},
      createdAt: now,
    });
    return ref.id;
  } catch (error) {
    console.error("Failed to persist observability event:", error);
    return null;
  }
}

export async function sendAlert(event: ObservabilityEventInput): Promise<void> {
  const url = serverEnv.ALERT_WEBHOOK_URL;
  if (!url) return;

  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: `[${event.severity.toUpperCase()}] ${event.source} - ${event.message}`,
        event,
      }),
    });
  } catch (error) {
    console.error("Failed to send alert webhook:", error);
  }
}

export async function reportError(
  base: Omit<ObservabilityEventInput, "severity" | "metadata"> & {
    severity?: ObservabilitySeverity;
    metadata?: Record<string, unknown>;
    error?: unknown;
    alert?: boolean;
  }
): Promise<void> {
  const event: ObservabilityEventInput = {
    type: base.type,
    source: base.source,
    message: base.message,
    userId: base.userId ?? null,
    requestId: base.requestId ?? null,
    severity: base.severity ?? "error",
    metadata: {
      ...(base.metadata ?? {}),
      ...(base.error ? { error: serializeError(base.error) } : {}),
    },
  };

  await logEvent(event);
  if (base.alert || event.severity === "critical") {
    await sendAlert(event);
  }
}
