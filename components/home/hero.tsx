import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function Hero() {
  return (
    <section className="relative overflow-hidden py-20 sm:py-28">
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute right-0 top-1/3 h-[300px] w-[400px] rounded-full bg-accent/10 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center animate-fade-in">
          <Badge variant="secondary" className="mb-6">
            <Sparkles className="mr-1 h-3 w-3" />
            AI Academic Research Platform
          </Badge>

          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Write Your Research Proposal{" "}
            <span className="text-primary">in Minutes</span>, Not Weeks
          </h1>

          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            SnowScribe.ai helps students and researchers generate proposals, literature reviews,
            and dissertations with AI — saving time while maintaining academic rigor.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/tools/research-proposal">
              <Button size="lg" className="gap-2">
                Try Research Proposal Generator
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/tools/literature-review">
              <Button variant="outline" size="lg">
                See Literature Review Tool
              </Button>
            </Link>
          </div>

          <p className="mt-4 text-sm text-muted-foreground">
            Start free with 50 credits. No credit card required.
          </p>
        </div>
      </div>
    </section>
  );
}
