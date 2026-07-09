import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { loginHrefForPath } from "@/lib/auth/redirect";
import { Button } from "@/components/ui/button";

export function CTA() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl bg-primary px-8 py-16 text-center sm:px-16">
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-primary/80" />
          <div className="relative z-10">
            <h2 className="text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl">
              Ready to accelerate your research?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-primary-foreground/80">
              Join thousands of students and researchers using SnowScribe.ai to produce
              higher-quality academic work in less time.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/register">
                <Button size="lg" variant="secondary" className="gap-2">
                  Start Free — 50 Credits
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href={loginHrefForPath("/tools/research-proposal")}>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
                >
                  Try Proposal Generator
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
