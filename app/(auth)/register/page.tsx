import { redirect } from "next/navigation";
import { RegisterForm } from "@/components/auth/register-form";
import { getSessionUser } from "@/lib/firebase/auth";
import { getSafeRedirectPath } from "@/lib/auth/redirect";

export const dynamic = "force-dynamic";

interface RegisterPageProps {
  searchParams: Promise<{ redirect?: string }>;
}

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const params = await searchParams;
  const user = await getSessionUser();

  if (user) {
    redirect(getSafeRedirectPath(params.redirect));
  }

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-16">
      <RegisterForm />
    </div>
  );
}
