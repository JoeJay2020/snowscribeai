import { getAdminDb } from "@/lib/firebase/admin";
import { isFirebaseAdminConfigured, isOpenRouterConfigured, serverEnv } from "@/lib/env/server";
import { probeOpenRouter } from "@/lib/ai/openrouter";

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
      const message = error instanceof Error ? error.message : "Firestore check failed";
      const invalidCredentials =
        message.includes("private key") ||
        message.includes("not valid JSON") ||
        message.includes("DECODER") ||
        message.includes("credential");

      services.push({
        name: "firebase-admin",
        state: "down",
        details: invalidCredentials
          ? `Firebase Admin credentials are invalid: ${message}`
          : message,
      });
    }
  }

  // OpenRouter
  if (!isOpenRouterConfigured()) {
    services.push({
      name: "openrouter",
      state: "not_configured",
      details: "OPENROUTER_API_KEY is missing.",
    });
  } else {
    try {
      await probeOpenRouter();
      services.push({
        name: "openrouter",
        state: "healthy",
        details: "OpenRouter API responded successfully.",
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "OpenRouter probe failed";
      const needsCredits =
        message.includes("402") ||
        message.toLowerCase().includes("more credits") ||
        message.toLowerCase().includes("can only afford");

      services.push({
        name: "openrouter",
        state: needsCredits ? "degraded" : "down",
        details: needsCredits
          ? "OpenRouter key works but has low credits. Affordable models are used automatically."
          : message,
      });
    }
  }

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
