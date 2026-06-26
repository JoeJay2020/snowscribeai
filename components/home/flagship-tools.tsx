import Link from "next/link";
import { FileText, BookOpen, GraduationCap, ArrowRight, Coins } from "lucide-react";
import { FLAGSHIP_TOOLS } from "@/lib/constants";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const iconMap = {
  FileText,
  BookOpen,
  GraduationCap,
} as const;

export function FlagshipTools() {
  return (
    <section className="py-20 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-12">
          <Badge variant="default" className="mb-4">Flagship Tools</Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Academic tools students actually pay for
          </h2>
          <p className="mt-4 text-muted-foreground">
            While others focus on general writing, SnowScribe specializes in the research
            workflow — from proposal to dissertation defense.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {FLAGSHIP_TOOLS.map((tool) => {
            const Icon = iconMap[tool.icon as keyof typeof iconMap];
            return (
              <Card
                key={tool.id}
                className="group relative h-full overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-primary/30"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                <CardHeader>
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="h-6 w-6" />
                  </div>
                  <CardTitle>{tool.name}</CardTitle>
                  <CardDescription>{tool.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Coins className="h-4 w-4" />
                      {tool.credits} credits
                    </div>
                    <Link href={tool.href}>
                      <Button variant="ghost" size="sm" className="gap-1 group-hover:text-primary">
                        Try now
                        <ArrowRight className="h-3 w-3" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
