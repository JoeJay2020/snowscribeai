import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSessionUser } from "@/lib/firebase/auth";
import { getDocument } from "@/lib/documents/store";
import { redirect, notFound } from "next/navigation";
import { DocumentEditor } from "@/components/workspace/document-editor";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function DocumentPage({ params }: PageProps) {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const { id } = await params;
  const document = await getDocument(user.uid, id);
  if (!document) notFound();

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <div className="px-4 py-2 border-b border-border">
        <Link
          href="/workspace"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          All documents
        </Link>
      </div>
      <div className="flex-1 overflow-hidden">
        <DocumentEditor
          documentId={document.id}
          initialTitle={document.title}
          initialContent={document.content}
        />
      </div>
    </div>
  );
}
