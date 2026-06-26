import type { PlanId } from "@/lib/constants";

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string | null;
  plan: PlanId;
  role: "user" | "admin";
  referralCode?: string;
  referredBy?: string;
  referredAt?: string;
  createdAt: string;
  updatedAt: string;
  onboardingComplete: boolean;
}

export interface CreditWallet {
  userId: string;
  balance: number;
  monthlyAllocation: number;
  monthlyUsed: number;
  renewsAt: string;
  updatedAt: string;
}

export interface CreditTransaction {
  id: string;
  userId: string;
  amount: number;
  type: "debit" | "credit" | "renewal" | "purchase" | "refund";
  description: string;
  toolId?: string;
  createdAt: string;
}

export interface Subscription {
  userId: string;
  planId: PlanId;
  status: "active" | "cancelled" | "past_due" | "trialing";
  provider: "pesepay" | "stripe";
  providerSubscriptionId: string | null;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AIRequest {
  id: string;
  userId: string;
  toolId: string;
  taskType: "simple" | "medium" | "complex";
  modelUsed: string;
  creditsConsumed: number;
  tokensIn: number;
  tokensOut: number;
  costUsd: number;
  status: "pending" | "completed" | "failed";
  createdAt: string;
}

export interface AssistantThread {
  id: string;
  userId: string;
  title: string;
  messageCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface AssistantMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  modelUsed?: string;
  createdAt: string;
}

export interface Document {
  id: string;
  userId: string;
  title: string;
  content: string;
  folderId: string | null;
  createdAt: string;
  updatedAt: string;
}
