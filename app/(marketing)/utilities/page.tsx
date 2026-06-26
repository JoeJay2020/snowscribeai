import Link from "next/link";
import { UTILITY_TOOLS } from "@/lib/utilities/text-tools";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function UtilitiesPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight">Free Writing Utilities</h1>
        <p className="mt-4 text-muted-foreground">
          Handy tools that run locally — no credits, no AI required.
        </p>
      </div>
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
                <Button variant="outline" size="sm" className="w-full">Open Tool</Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
