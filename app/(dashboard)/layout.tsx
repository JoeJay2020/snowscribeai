import { Suspense } from "react";
import { AppHeader } from "@/components/layout/app-header";
import { Providers } from "@/components/providers";

export const dynamic = "force-dynamic";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Providers>
      <Suspense fallback={<div className="h-16 border-b border-border/60" />}>
        <AppHeader />
      </Suspense>
      <main className="flex-1">{children}</main>
    </Providers>
  );
}