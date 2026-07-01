import { Providers } from "@/components/providers";

export const dynamic = "force-dynamic";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Providers>
      <main className="flex-1">{children}</main>
    </Providers>
  );
}