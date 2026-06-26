import {
  PenTool,
  Search,
  Shield,
  Zap,
  Globe,
  FileOutput,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const features = [
  {
    icon: Search,
    title: "Research-First AI",
    description:
      "Purpose-built for academic workflows — proposals, literature reviews, methodology, and citations.",
  },
  {
    icon: Zap,
    title: "Smart Model Routing",
    description:
      "Intelligent AI routing picks the most cost-efficient model for each task without sacrificing quality.",
  },
  {
    icon: PenTool,
    title: "18+ Academic Tools",
    description:
      "From hypothesis generation to dissertation chapters — every stage of your research covered.",
  },
  {
    icon: FileOutput,
    title: "Export Anywhere",
    description:
      "Download your work as PDF, DOCX, or Markdown. Ready for submission or further editing.",
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description:
      "JWT authentication, rate limiting, input sanitization, and audit logging built in from day one.",
  },
  {
    icon: Globe,
    title: "Built for Africa",
    description:
      "Pesepay integration for local payments. Affordable student plans designed for emerging markets.",
  },
];

export function Features() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Everything you need for academic success
          </h2>
          <p className="mt-4 text-muted-foreground">
            A complete platform — not just another paraphrasing tool.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Card key={feature.title} className="h-full border-border/60 hover:border-primary/20 transition-colors">
              <CardHeader>
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <feature.icon className="h-5 w-5" />
                </div>
                <CardTitle className="text-base">{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
