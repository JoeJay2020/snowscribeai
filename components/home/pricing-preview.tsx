import Link from "next/link";
import { Check } from "lucide-react";
import { PLANS } from "@/lib/constants";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const displayPlans = [PLANS.FREE, PLANS.STUDENT, PLANS.PRO] as const;

export function PricingPreview() {
  return (
    <section className="py-20 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Simple, affordable pricing
          </h2>
          <p className="mt-4 text-muted-foreground">
            Start free. Upgrade when you need more credits and premium academic tools.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {displayPlans.map((plan) => (
            <Card
              key={plan.id}
              className={`h-full ${
                plan.id === "student"
                  ? "border-primary shadow-lg ring-1 ring-primary/20"
                  : ""
              }`}
            >
              <CardHeader>
                {plan.id === "student" && (
                  <Badge className="w-fit mb-2">Most Popular</Badge>
                )}
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>
                  <span className="text-3xl font-bold text-foreground">
                    {plan.price === 0 ? "Free" : `$${plan.price}`}
                  </span>
                  {plan.price > 0 && (
                    <span className="text-muted-foreground">/month</span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/pricing" className="block mt-6">
                  <Button
                    variant={plan.id === "student" ? "default" : "outline"}
                    className="w-full"
                  >
                    {plan.price === 0 ? "Get Started" : "Choose Plan"}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
