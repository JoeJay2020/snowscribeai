"use client";

import { useSearchParams } from "next/navigation";
import { LoginForm } from "@/components/auth/login-form";
import { getSafeRedirectPath } from "@/lib/auth/redirect";

export function LoginFormWithRedirect() {
  const searchParams = useSearchParams();
  const redirect = getSafeRedirectPath(searchParams.get("redirect"));
  return <LoginForm redirect={redirect} />;
}
