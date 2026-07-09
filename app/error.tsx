"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col items-center justify-center px-4 antialiased">
        <AlertCircle className="mb-4 h-10 w-10 text-destructive" />
        <h1 className="text-xl font-semibold">Something went wrong</h1>
        <p className="mt-2 max-w-md text-center text-sm text-muted-foreground">
          An unexpected error occurred. Please try again.
        </p>
        <div className="mt-6 flex gap-3">
          <Button onClick={reset} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Try again
          </Button>
          <Link href="/">
            <Button variant="outline">Go home</Button>
          </Link>
        </div>
      </body>
    </html>
  );
}
