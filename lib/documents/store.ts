import { getAdminDb } from "@/lib/firebase/admin";
import type { Document as DocType } from "@/types/database";

export async function listDocuments(userId: string): Promise<DocType[]> {
  const db = getAdminDb();
  const snapshot = await db
    .collection("documents")
    .where("userId", "==", userId)
    .limit(50)
    .get();

  return snapshot.docs
    .map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
    .sort((a, b) => {
      const aDate = (a as { updatedAt?: string }).updatedAt ?? "";
      const bDate = (b as { updatedAt?: string }).updatedAt ?? "";
      return bDate.localeCompare(aDate);
    }) as DocType[];
}

export async function getDocument(
  userId: string,
  docId: string
): Promise<DocType | null> {
  const db = getAdminDb();
  const doc = await db.collection("documents").doc(docId).get();
  if (!doc.exists) return null;
  const data = doc.data()!;
  if (data.userId !== userId) return null;
  return { id: doc.id, ...data } as DocType;
}

export async function createDocument(
  userId: string,
  title: string,
  content: string = ""
): Promise<string> {
  const db = getAdminDb();
  const now = new Date().toISOString();
  const ref = await db.collection("documents").add({
    userId,
    title,
    content,
    folderId: null,
    createdAt: now,
    updatedAt: now,
  });
  return ref.id;
}

export async function updateDocument(
  userId: string,
  docId: string,
  updates: { title?: string; content?: string }
): Promise<void> {
  const db = getAdminDb();
  const docRef = db.collection("documents").doc(docId);
  const doc = await docRef.get();
  if (!doc.exists || doc.data()?.userId !== userId) {
    throw new Error("Document not found");
  }

  await docRef.update({
    ...updates,
    updatedAt: new Date().toISOString(),
  });

  // Save version snapshot (keep last 10)
  if (updates.content) {
    await docRef.collection("versions").add({
      content: updates.content,
      title: updates.title ?? doc.data()?.title,
      createdAt: new Date().toISOString(),
    });
  }
}

export async function deleteDocument(userId: string, docId: string): Promise<void> {
  const db = getAdminDb();
  const docRef = db.collection("documents").doc(docId);
  const doc = await docRef.get();
  if (!doc.exists || doc.data()?.userId !== userId) {
    throw new Error("Document not found");
  }
  await docRef.delete();
}

export async function countDocuments(userId: string): Promise<number> {
  const db = getAdminDb();
  const snapshot = await db
    .collection("documents")
    .where("userId", "==", userId)
    .count()
    .get();
  return snapshot.data().count;
}
