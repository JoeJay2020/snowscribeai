import Link from "next/link";
import { Coins, FileText, Sparkles, ArrowRight, MessageSquare } from "lucide-react";
import { getSessionUser } from "@/lib/firebase/auth";
import { ensureUserProvisioned } from "@/lib/auth/provision-user";
import { countDocuments } from "@/lib/documents/store";
import { isFirebaseAdminConfigured } from "@/lib/env/server";
import { FLAGSHIP_TOOLS, PLANS } from "@/lib/constants";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SubscribeButton } from "@/components/billing/subscribe-button";
import { formatCredits } from "@/lib/utils";
import { RewardsPanel } from "@/components/growth/rewards-panel";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  let user = await getSessionUser();
  if (user) {
    await ensureUserProvisioned(user.uid, user.email, user.displayName);
    user = await getSessionUser();
  }
  let docCount = 0;
  if (user && isFirebaseAdminConfigured()) {
    try {
      docCount = await countDocuments(user.uid);
    } catch {
      docCount = 0;
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">
          Welcome{user?.displayName ? `, ${user.displayName.split(" ")[0]}` : ""}
        </h1>
        <p className="text-muted-foreground">
          Your academic research workspace
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Credit Balance
            </CardTitle>
            <Coins className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCredits(user?.credits ?? 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {PLANS[user?.plan ?? "FREE"].name} plan
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Monthly Allocation
            </CardTitle>
            <Sparkles className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCredits(PLANS[user?.plan ?? "FREE"].monthlyCredits ?? 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Credits per month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Documents
            </CardTitle>
            <FileText className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{docCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              <Link href="/workspace" className="hover:text-primary">Open workspace →</Link>
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Flagship Academic Tools</h2>
          <Link href="/tools">
            <Button variant="ghost" size="sm" className="gap-1">
              View all tools
              <ArrowRight className="h-3 w-3" />
            </Button>
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {FLAGSHIP_TOOLS.map((tool) => (
            <Card key={tool.id} className="hover:border-primary/30 transition-colors">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{tool.name}</CardTitle>
                  <Badge variant="secondary">{tool.credits} credits</Badge>
                </div>
                <CardDescription className="line-clamp-2">
                  {tool.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href={tool.href}>
                  <Button size="sm" className="w-full">Launch Tool</Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="mb-8">
        <Card className="border-primary/20">
          <CardContent className="flex items-center justify-between gap-4 p-6">
            <div>
              <h3 className="flex items-center gap-2 font-semibold">
                <MessageSquare className="h-4 w-4 text-primary" />
                AI Assistant (Phase 3)
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Chat with your academic copilot and upload text files for context-aware responses.
              </p>
            </div>
            <Link href="/assistant">
              <Button>Open Assistant</Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="mb-8">
        <RewardsPanel />
      </div>

      {(user?.plan ?? "FREE") === "FREE" && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6">
            <div>
              <h3 className="font-semibold">Upgrade to Student Plan</h3>
              <p className="text-sm text-muted-foreground">
                Get 500 credits/month and unlock all academic research tools for just $4.99/mo.
              </p>
            </div>
            <SubscribeButton planId="STUDENT">Upgrade to Student — $4.99/mo</SubscribeButton>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
