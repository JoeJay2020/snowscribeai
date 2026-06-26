import { getAdminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";

export interface AssistantThread {
  id: string;
  userId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
}

export interface AssistantMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
  modelUsed?: string;
  attachments?: Array<{ name: string; mimeType?: string }>;
}

export async function createThread(
  userId: string,
  title: string
): Promise<AssistantThread> {
  const db = getAdminDb();
  const now = new Date().toISOString();
  const ref = await db.collection("assistantThreads").add({
    userId,
    title,
    createdAt: now,
    updatedAt: now,
    messageCount: 0,
  });

  return {
    id: ref.id,
    userId,
    title,
    createdAt: now,
    updatedAt: now,
    messageCount: 0,
  };
}

export async function listThreads(userId: string): Promise<AssistantThread[]> {
  const db = getAdminDb();
  const snap = await db
    .collection("assistantThreads")
    .where("userId", "==", userId)
    .orderBy("updatedAt", "desc")
    .limit(30)
    .get();

  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as AssistantThread[];
}

export async function getThread(
  userId: string,
  threadId: string
): Promise<AssistantThread | null> {
  const db = getAdminDb();
  const doc = await db.collection("assistantThreads").doc(threadId).get();
  if (!doc.exists) return null;
  const data = doc.data() as AssistantThread;
  if (data.userId !== userId) return null;
  return { id: doc.id, ...data };
}

export async function listMessages(
  userId: string,
  threadId: string
): Promise<AssistantMessage[]> {
  const thread = await getThread(userId, threadId);
  if (!thread) return [];

  const db = getAdminDb();
  const snap = await db
    .collection("assistantThreads")
    .doc(threadId)
    .collection("messages")
    .orderBy("createdAt", "asc")
    .limit(200)
    .get();

  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as AssistantMessage[];
}

export async function addMessage(
  userId: string,
  threadId: string,
  message: Omit<AssistantMessage, "id" | "createdAt"> & { createdAt?: string }
): Promise<void> {
  const thread = await getThread(userId, threadId);
  if (!thread) throw new Error("Thread not found");

  const db = getAdminDb();
  const now = message.createdAt ?? new Date().toISOString();
  const threadRef = db.collection("assistantThreads").doc(threadId);
  const msgRef = threadRef.collection("messages").doc();

  await db.runTransaction(async (tx) => {
    tx.set(msgRef, {
      role: message.role,
      content: message.content,
      createdAt: now,
      modelUsed: message.modelUsed ?? null,
      attachments: message.attachments ?? [],
    });
    tx.update(threadRef, {
      updatedAt: now,
      messageCount: FieldValue.increment(1),
    });
  });
}
