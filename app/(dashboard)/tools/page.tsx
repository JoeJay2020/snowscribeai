import Link from "next/link";
import { getToolsByCategory } from "@/lib/tools";
import { UTILITY_TOOLS } from "@/lib/utilities/text-tools";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default function ToolsPage() {
  const { flagship, academic, writing } = getToolsByCategory();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold mb-2">All Tools</h1>
      <p className="text-muted-foreground mb-8">
        AI-powered academic and writing tools for every stage of your research.
      </p>

      <section className="mb-10">
        <h2 className="text-lg font-semibold mb-4">Flagship Academic Tools</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {flagship.map((tool) => (
            <ToolCard key={tool.id} tool={tool} featured />
          ))}
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-lg font-semibold mb-4">Academic Research Tools</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {academic.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-lg font-semibold mb-4">Writing Tools</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {writing.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-4">Free Utilities</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {UTILITY_TOOLS.map((tool) => (
            <Card key={tool.id}>
              <CardHeader>
                <Badge variant="success" className="w-fit mb-2">Free</Badge>
                <CardTitle className="text-base">{tool.name}</CardTitle>
                <CardDescription>{tool.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href={tool.href}>
                  <Button variant="outline" size="sm" className="w-full">Open</Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}

function ToolCard({
  tool,
  featured,
}: {
  tool: { id: string; name: string; description: string; creditCost: number };
  featured?: boolean;
}) {
  return (
    <Card className={`hover:border-primary/30 transition-colors ${featured ? "border-primary/20" : ""}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{tool.name}</CardTitle>
          <Badge variant="secondary">{tool.creditCost} credits</Badge>
        </div>
        <CardDescription className="line-clamp-2">{tool.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Link href={`/tools/${tool.id}`}>
          <Button size="sm" className="w-full" variant={featured ? "default" : "outline"}>
            Launch Tool
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
