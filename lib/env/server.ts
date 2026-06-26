import { z } from "zod";

const serverSchema = z.object({
  FIREBASE_SERVICE_ACCOUNT_KEY: z.string().optional(),
  FIREBASE_PROJECT_ID: z.string().optional(),
  FIREBASE_CLIENT_EMAIL: z.string().optional(),
  FIREBASE_PRIVATE_KEY: z.string().optional(),
  OPENROUTER_API_KEY: z.string().optional(),
  PESEPAY_INTEGRATION_KEY: z.string().optional(),
  PESEPAY_ENCRYPTION_KEY: z.string().optional(),
  PESEPAY_RETURN_URL: z.string().optional(),
  PESEPAY_RESULT_URL: z.string().optional(),
  ALERT_WEBHOOK_URL: z.string().optional(),
  NEXT_PUBLIC_APP_URL: z.string().optional(),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
});

function trimEnv(value: string | undefined): string | undefined {
  return value?.trim() || undefined;
}

export const serverEnv = serverSchema.parse({
  FIREBASE_SERVICE_ACCOUNT_KEY: trimEnv(process.env.FIREBASE_SERVICE_ACCOUNT_KEY),
  FIREBASE_PROJECT_ID: trimEnv(process.env.FIREBASE_PROJECT_ID),
  FIREBASE_CLIENT_EMAIL: trimEnv(process.env.FIREBASE_CLIENT_EMAIL),
  FIREBASE_PRIVATE_KEY: trimEnv(process.env.FIREBASE_PRIVATE_KEY),
  OPENROUTER_API_KEY: trimEnv(process.env.OPENROUTER_API_KEY),
  PESEPAY_INTEGRATION_KEY: trimEnv(process.env.PESEPAY_INTEGRATION_KEY),
  PESEPAY_ENCRYPTION_KEY: trimEnv(process.env.PESEPAY_ENCRYPTION_KEY),
  PESEPAY_RETURN_URL: trimEnv(process.env.PESEPAY_RETURN_URL),
  PESEPAY_RESULT_URL: trimEnv(process.env.PESEPAY_RESULT_URL),
  ALERT_WEBHOOK_URL: trimEnv(process.env.ALERT_WEBHOOK_URL),
  NEXT_PUBLIC_APP_URL: trimEnv(process.env.NEXT_PUBLIC_APP_URL),
  NODE_ENV: process.env.NODE_ENV,
});

export function isFirebaseAdminConfigured(): boolean {
  if (serverEnv.FIREBASE_SERVICE_ACCOUNT_KEY) return true;
  return Boolean(
    serverEnv.FIREBASE_PROJECT_ID &&
      serverEnv.FIREBASE_CLIENT_EMAIL &&
      serverEnv.FIREBASE_PRIVATE_KEY
  );
}

export function isOpenRouterConfigured(): boolean {
  return Boolean(serverEnv.OPENROUTER_API_KEY);
}
