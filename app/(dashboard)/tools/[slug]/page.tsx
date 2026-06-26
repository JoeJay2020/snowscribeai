import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSessionUser } from "@/lib/firebase/auth";
import { getToolDefinition } from "@/lib/tools";
import { ToolWorkspace } from "@/components/tools/tool-workspace";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

interface ToolPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ToolPage({ params }: ToolPageProps) {
  const { slug } = await params;
  const tool = getToolDefinition(slug);
  const user = await getSessionUser();

  if (!tool) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">Tool not found</h1>
        <Link href="/dashboard" className="mt-4 inline-block">
          <Button variant="outline">Back to dashboard</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to dashboard
      </Link>

      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Badge>{tool.creditCost} credits per generation</Badge>
        </div>
        <h1 className="text-2xl font-bold">{tool.name}</h1>
        <p className="text-muted-foreground mt-1">{tool.description}</p>
      </div>

      <ToolWorkspace tool={tool} initialCredits={user?.credits} />
    </div>
  );
}
