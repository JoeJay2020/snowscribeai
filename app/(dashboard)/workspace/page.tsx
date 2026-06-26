import { DocumentList } from "@/components/workspace/document-list";

export const dynamic = "force-dynamic";

export default function WorkspacePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <DocumentList />
    </div>
  );
}
