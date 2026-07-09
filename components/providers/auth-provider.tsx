"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
  type User,
} from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase/client";
import { createUserProfile } from "@/lib/firebase/firestore";
import { isFirebaseConfigured } from "@/lib/env/client";
import type { AuthUser } from "@/types/auth";

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  isConfigured: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function mapUser(user: User): AuthUser {
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
    emailVerified: user.emailVerified,
  };
}

async function establishSession(idToken: string): Promise<void> {
  const response = await fetch("/api/auth/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
    credentials: "same-origin",
  });

  if (!response.ok) {
    const data = (await response.json().catch(() => null)) as
      | { error?: string }
      | null;
    throw new Error(
      data?.error ??
        "Could not start your session. Check server auth configuration."
    );
  }
}

async function clearServerSession(): Promise<void> {
  try {
    await fetch("/api/auth/logout", { method: "POST", credentials: "same-origin" });
  } catch {
    // Best effort
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const configured = isFirebaseConfigured();

  useEffect(() => {
    if (!configured) {
      setLoading(false);
      return;
    }

    const auth = getFirebaseAuth();
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          setUser(mapUser(firebaseUser));
          const token = await firebaseUser.getIdToken(true);
          await establishSession(token);
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
        await clearServerSession();
        try {
          await firebaseSignOut(auth);
        } catch {
          // Ignore sign-out errors
        }
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, [configured]);

  const signIn = useCallback(async (email: string, password: string) => {
    const auth = getFirebaseAuth();
    const result = await signInWithEmailAndPassword(auth, email, password);
    const token = await result.user.getIdToken(true);
    await establishSession(token);
  }, []);

  const signUp = useCallback(
    async (email: string, password: string, displayName: string) => {
      const auth = getFirebaseAuth();
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(result.user, { displayName });
      await createUserProfile(result.user.uid, email, displayName);
      const token = await result.user.getIdToken(true);
      await establishSession(token);
    },
    []
  );

  const signInWithGoogle = useCallback(async () => {
    const auth = getFirebaseAuth();
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    if (result.user.displayName && result.user.email) {
      await createUserProfile(
        result.user.uid,
        result.user.email,
        result.user.displayName
      );
    }
    const token = await result.user.getIdToken(true);
    await establishSession(token);
  }, []);

  const signOut = useCallback(async () => {
    await clearServerSession();
    const auth = getFirebaseAuth();
    await firebaseSignOut(auth);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isConfigured: configured,
        signIn,
        signUp,
        signInWithGoogle,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function useOptionalAuth(): AuthContextValue | null {
  return useContext(AuthContext);
}
