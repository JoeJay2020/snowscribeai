import type { PlanId } from "@/lib/constants";

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
}

export interface SessionUser extends AuthUser {
  plan: PlanId;
  role: "user" | "admin";
  credits: number;
}
