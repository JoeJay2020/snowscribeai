"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import { PLANS, type PlanId } from "@/lib/constants";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SubscribeButton } from "@/components/billing/subscribe-button";

const planKeys: PlanId[] = ["FREE", "STUDENT", "PRO", "BUSINESS", "ENTERPRISE"];

export function PricingCards() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {planKeys.map((key) => {
        const plan = PLANS[key];
        return (
          <Card
            key={plan.id}
            className={`flex flex-col ${
              plan.id === "student" ? "border-primary ring-1 ring-primary/20" : ""
            }`}
          >
            <CardHeader>
              {plan.id === "student" && (
                <Badge className="w-fit mb-2">Most Popular</Badge>
              )}
              <CardTitle>{plan.name}</CardTitle>
              <CardDescription>
                <span className="text-3xl font-bold text-foreground">
                  {plan.price === null
                    ? "Custom"
                    : plan.price === 0
                      ? "Free"
                      : `$${plan.price}`}
                </span>
                {plan.price !== null && plan.price > 0 && (
                  <span className="text-muted-foreground">/mo</span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <ul className="space-y-2 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-6">
                {plan.id === "enterprise" ? (
                  <Link href="mailto:hello@snowscribe.ai">
                    <Button variant="outline" className="w-full">Contact Sales</Button>
                  </Link>
                ) : plan.price === 0 ? (
                  <Link href="/register">
                    <Button variant="outline" className="w-full">Get Started</Button>
                  </Link>
                ) : (
                  <SubscribeButton
                    planId={key}
                    variant={plan.id === "student" ? "default" : "outline"}
                    className="w-full"
                  >
                    Subscribe via Pesepay
                  </SubscribeButton>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
