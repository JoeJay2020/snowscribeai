"use client";

import { ThemeProvider } from "@/components/providers/theme-provider";

export function MarketingProviders({ children }: { children: React.ReactNode }) {
  return <ThemeProvider>{children}</ThemeProvider>;
}
