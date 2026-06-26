"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AnalyticsResponse {
  totals: {
    users: number;
    aiRequests: number;
    revenueUsd: number;
    referrals: number;
    couponRedemptions: number;
  };
  trends: {
    requestsLast7Days: number;
  };
  topTools: Array<{ toolId: string; requests: number }>;
}

export function AdminAnalyticsPanel() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null);

  useEffect(() => {
    fetch("/api/admin/analytics")
      .then((res) => res.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setAnalytics(data);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load analytics"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  if (error || !analytics) {
    return <p className="text-sm text-destructive">{error || "Analytics unavailable."}</p>;
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Users" value={String(analytics.totals.users)} />
        <StatCard label="AI Requests" value={String(analytics.totals.aiRequests)} />
        <StatCard label="Revenue (USD)" value={`$${analytics.totals.revenueUsd.toFixed(2)}`} />
        <StatCard label="Referrals" value={String(analytics.totals.referrals)} />
        <StatCard label="Coupon Redemptions" value={String(analytics.totals.couponRedemptions)} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Usage Snapshot</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p className="text-muted-foreground">
            Requests in last 7 days:{" "}
            <span className="font-semibold text-foreground">{analytics.trends.requestsLast7Days}</span>
          </p>
          <div>
            <p className="mb-2 font-medium">Top tools by recent requests</p>
            <div className="space-y-1">
              {analytics.topTools.map((tool) => (
                <div key={tool.toolId} className="flex items-center justify-between rounded-md border p-2">
                  <span>{tool.toolId}</span>
                  <span className="text-muted-foreground">{tool.requests}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}
