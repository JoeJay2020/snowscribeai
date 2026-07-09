import { Suspense } from "react";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { AppHeader } from "@/components/layout/app-header";
import { Providers } from "@/components/providers";
import { getSessionUser } from "@/lib/firebase/auth";
import { SESSION_COOKIE_NAME } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();

  if (!user) {
    const cookieStore = await cookies();
    if (cookieStore.get(SESSION_COOKIE_NAME)?.value) {
      redirect("/api/auth/logout?redirect=/login");
    }
    redirect("/login");
  }

  return (
    <Providers>
      <Suspense fallback={<div className="h-16 border-b border-border/60" />}>
        <AppHeader />
      </Suspense>
      <main className="flex-1">{children}</main>
    </Providers>
  );
}
