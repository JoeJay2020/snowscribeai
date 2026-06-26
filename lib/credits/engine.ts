import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebase/admin";
import { PLANS } from "@/lib/constants";
import type { PlanId } from "@/lib/constants";
import type { CreditWallet, CreditTransaction } from "@/types/database";

export class InsufficientCreditsError extends Error {
  constructor(required: number, available: number) {
    super(`Insufficient credits: need ${required}, have ${available}`);
    this.name = "InsufficientCreditsError";
  }
}

export class DailyLimitError extends Error {
  constructor(limit: number) {
    super(`Daily request limit of ${limit} reached`);
    this.name = "DailyLimitError";
  }
}

export async function getWallet(userId: string): Promise<CreditWallet | null> {
  const db = getAdminDb();
  const doc = await db.collection("creditWallets").doc(userId).get();
  if (!doc.exists) return null;
  const data = doc.data()!;
  return {
    userId,
    balance: data.balance ?? 0,
    monthlyAllocation: data.monthlyAllocation ?? PLANS.FREE.monthlyCredits,
    monthlyUsed: data.monthlyUsed ?? 0,
    renewsAt: data.renewsAt ?? new Date().toISOString(),
    updatedAt: data.updatedAt ?? new Date().toISOString(),
  };
}

export async function checkAndDeductCredits(
  userId: string,
  amount: number,
  toolId: string,
  description: string
): Promise<{ newBalance: number; transactionId: string }> {
  const db = getAdminDb();

  return db.runTransaction(async (transaction) => {
    const walletRef = db.collection("creditWallets").doc(userId);
    const userRef = db.collection("users").doc(userId);
    const walletDoc = await transaction.get(walletRef);
    const userDoc = await transaction.get(userRef);

    if (!walletDoc.exists) {
      throw new Error("Credit wallet not found");
    }

    const wallet = walletDoc.data()!;
    const plan = (userDoc.data()?.plan as PlanId) ?? "FREE";
    const planConfig = PLANS[plan];
    const balance = wallet.balance ?? 0;

    if (balance < amount) {
      throw new InsufficientCreditsError(amount, balance);
    }

    // Check daily limit
    const today = new Date().toISOString().split("T")[0];
    const dailyUsageRef = db.collection("dailyUsage").doc(`${userId}_${today}`);
    const dailyDoc = await transaction.get(dailyUsageRef);
    const dailyCount = dailyDoc.data()?.count ?? 0;
    const dailyLimit = planConfig.dailyLimit ?? 10;

    if (dailyLimit && dailyCount >= dailyLimit) {
      throw new DailyLimitError(dailyLimit);
    }

    const newBalance = balance - amount;

    transaction.update(walletRef, {
      balance: newBalance,
      monthlyUsed: FieldValue.increment(amount),
      updatedAt: new Date().toISOString(),
    });

    transaction.set(
      dailyUsageRef,
      { userId, date: today, count: FieldValue.increment(1) },
      { merge: true }
    );

    const txRef = db.collection("creditTransactions").doc();
    transaction.set(txRef, {
      userId,
      amount: -amount,
      type: "debit",
      description,
      toolId,
      createdAt: new Date().toISOString(),
    });

    return { newBalance, transactionId: txRef.id };
  });
}

export async function addCredits(
  userId: string,
  amount: number,
  type: CreditTransaction["type"],
  description: string
): Promise<number> {
  const db = getAdminDb();

  return db.runTransaction(async (transaction) => {
    const walletRef = db.collection("creditWallets").doc(userId);
    const walletDoc = await transaction.get(walletRef);

    if (!walletDoc.exists) {
      throw new Error("Credit wallet not found");
    }

    const balance = walletDoc.data()!.balance ?? 0;
    const newBalance = balance + amount;

    transaction.update(walletRef, {
      balance: newBalance,
      updatedAt: new Date().toISOString(),
    });

    const txRef = db.collection("creditTransactions").doc();
    transaction.set(txRef, {
      userId,
      amount,
      type,
      description,
      createdAt: new Date().toISOString(),
    });

    return newBalance;
  });
}

export async function renewMonthlyCredits(userId: string, planId: PlanId): Promise<void> {
  const db = getAdminDb();
  const allocation = PLANS[planId].monthlyCredits ?? PLANS.FREE.monthlyCredits;
  const renewsAt = new Date();
  renewsAt.setMonth(renewsAt.getMonth() + 1);

  await db.collection("creditWallets").doc(userId).update({
    balance: allocation,
    monthlyAllocation: allocation,
    monthlyUsed: 0,
    renewsAt: renewsAt.toISOString(),
    updatedAt: new Date().toISOString(),
  });

  await db.collection("creditTransactions").add({
    userId,
    amount: allocation,
    type: "renewal",
    description: `Monthly credit renewal — ${PLANS[planId].name} plan`,
    createdAt: new Date().toISOString(),
  });
}

export async function getTransactionHistory(
  userId: string,
  limit = 20
): Promise<CreditTransaction[]> {
  const db = getAdminDb();
  const snapshot = await db
    .collection("creditTransactions")
    .where("userId", "==", userId)
    .orderBy("createdAt", "desc")
    .limit(limit)
    .get();

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as CreditTransaction[];
}
