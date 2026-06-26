"use client";

import { ThemeProvider } from "@/components/providers/theme-provider";
import { AuthProvider } from "@/components/providers/auth-provider";
import { AnalyticsProvider } from "@/components/providers/analytics-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AnalyticsProvider>{children}</AnalyticsProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
