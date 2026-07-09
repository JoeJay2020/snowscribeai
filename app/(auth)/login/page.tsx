import { Suspense } from "react";
import { redirect } from "next/navigation";
import { LoginFormWithRedirect } from "@/components/auth/login-form-with-redirect";
import { getSessionUser } from "@/lib/firebase/auth";
import { getSafeRedirectPath } from "@/lib/auth/redirect";

export const dynamic = "force-dynamic";

interface LoginPageProps {
  searchParams: Promise<{ redirect?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const user = await getSessionUser();

  if (user) {
    redirect(getSafeRedirectPath(params.redirect));
  }

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-16">
      <Suspense fallback={<div className="text-muted-foreground">Loading...</div>}>
        <LoginFormWithRedirect />
      </Suspense>
    </div>
  );
}
