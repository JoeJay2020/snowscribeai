import { Suspense } from "react";
import { LoginFormWithRedirect } from "@/components/auth/login-form-with-redirect";

export default function LoginPage() {
  return (
    <div className="flex flex-1 items-center justify-center px-4 py-16">
      <Suspense fallback={<div className="text-muted-foreground">Loading...</div>}>
        <LoginFormWithRedirect />
      </Suspense>
    </div>
  );
}
