"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard error:", error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-24 text-center">
      <AlertCircle className="mb-4 h-10 w-10 text-destructive" />
      <h2 className="text-xl font-semibold">Something went wrong</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        We could not load this page. Try again or return to your dashboard.
      </p>
      <div className="mt-6 flex gap-3">
        <Button onClick={reset} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Try again
        </Button>
        <Link href="/dashboard">
          <Button variant="outline">Go to dashboard</Button>
        </Link>
      </div>
    </div>
  );
}
