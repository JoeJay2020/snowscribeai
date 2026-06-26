/**
 * Convenience re-exports for client-side Firebase usage.
 * Prefer @/lib/firebase/client for lazy initialization.
 */
import { getFirebaseApp, getFirebaseAuth, getFirebaseDb } from "@/lib/firebase/client";
import { getStorage } from "firebase/storage";

const app = getFirebaseApp();

export const auth = getFirebaseAuth();
export const db = getFirebaseDb();
export const storage = getStorage(app);
export default app;
