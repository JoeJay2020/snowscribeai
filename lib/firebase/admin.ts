import {
  initializeApp,
  getApps,
  cert,
  type App,
} from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { isFirebaseAdminConfigured, serverEnv } from "@/lib/env/server";

let adminApp: App | undefined;
let adminAuth: Auth | undefined;
let adminDb: Firestore | undefined;

function normalizeServiceAccountJson(raw: string): string {
  let value = raw.trim();
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1);
  }
  return value.replace(/\r\n/g, "\\n").replace(/\n/g, "\\n");
}

function getServiceAccount() {
  if (serverEnv.FIREBASE_SERVICE_ACCOUNT_KEY) {
    try {
      return JSON.parse(
        normalizeServiceAccountJson(serverEnv.FIREBASE_SERVICE_ACCOUNT_KEY)
      );
    } catch {
      throw new Error(
        "FIREBASE_SERVICE_ACCOUNT_KEY is not valid JSON. Use the 3-variable setup instead (recommended on Vercel)."
      );
    }
  }
  return {
    projectId: serverEnv.FIREBASE_PROJECT_ID,
    clientEmail: serverEnv.FIREBASE_CLIENT_EMAIL,
    privateKey: serverEnv.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  };
}

export function getAdminApp(): App {
  if (!isFirebaseAdminConfigured()) {
    throw new Error(
      "Firebase Admin is not configured. Set FIREBASE_SERVICE_ACCOUNT_KEY or individual credentials."
    );
  }
  if (!adminApp) {
    adminApp =
      getApps().length === 0
        ? initializeApp({ credential: cert(getServiceAccount()) })
        : getApps()[0];
  }
  return adminApp;
}

export function getAdminAuth(): Auth {
  if (!adminAuth) {
    adminAuth = getAuth(getAdminApp());
  }
  return adminAuth;
}

export function getAdminDb(): Firestore {
  if (!adminDb) {
    adminDb = getFirestore(getAdminApp());
  }
  return adminDb;
}
