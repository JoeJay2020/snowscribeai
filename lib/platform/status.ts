import { getAdminDb } from "@/lib/firebase/admin";
import { isFirebaseAdminConfigured, isOpenRouterConfigured, serverEnv } from "@/lib/env/server";

export type ServiceState = "healthy" | "degraded" | "down" | "not_configured";

export interface ServiceStatus {
  name: string;
  state: ServiceState;
  details: string;
}

export interface PlatformStatusReport {
  overall: ServiceState;
  timestamp: string;
  services: ServiceStatus[];
}

function resolveOverallState(states: ServiceState[]): ServiceState {
  if (states.includes("down")) return "down";
  if (states.includes("degraded")) return "degraded";
  if (states.includes("not_configured")) return "degraded";
  return "healthy";
}

export async function getPlatformStatus(): Promise<PlatformStatusReport> {
  const services: ServiceStatus[] = [];

  // Firebase Admin / Firestore
  if (!isFirebaseAdminConfigured()) {
    services.push({
      name: "firebase-admin",
      state: "not_configured",
      details: "Service account credentials are missing.",
    });
  } else {
    try {
      const db = getAdminDb();
      await db.collection("users").limit(1).get();
      services.push({
        name: "firebase-admin",
        state: "healthy",
        details: "Connected to Firestore.",
      });
    } catch (error) {
      services.push({
        name: "firebase-admin",
        state: "down",
        details: error instanceof Error ? error.message : "Firestore check failed",
      });
    }
  }

  // OpenRouter
  services.push({
    name: "openrouter",
    state: isOpenRouterConfigured() ? "healthy" : "not_configured",
    details: isOpenRouterConfigured()
      ? "OPENROUTER_API_KEY present."
      : "OPENROUTER_API_KEY is missing.",
  });

  // Pesepay
  const pesepayConfigured = Boolean(
    serverEnv.PESEPAY_INTEGRATION_KEY && serverEnv.PESEPAY_ENCRYPTION_KEY
  );
  services.push({
    name: "pesepay",
    state: pesepayConfigured ? "healthy" : "not_configured",
    details: pesepayConfigured
      ? "Pesepay integration keys present."
      : "Pesepay keys are missing.",
  });

  const overall = resolveOverallState(services.map((s) => s.state));
  return {
    overall,
    timestamp: new Date().toISOString(),
    services,
  };
}
