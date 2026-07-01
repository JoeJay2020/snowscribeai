"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    posthog?: { capture: (event: string, props?: Record<string, unknown>) => void };
  }
}

export function trackEvent(event: string, properties?: Record<string, unknown>) {
  if (typeof window === "undefined") return;

  if (window.posthog) {
    window.posthog.capture(event, properties);
  }

  if (window.gtag) {
    window.gtag("event", event, properties);
  }

  if (process.env.NODE_ENV === "development") {
    console.debug("[analytics]", event, properties);
  }
}

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    trackEvent("page_view", { path: window.location.pathname });
  }, []);

  return <>{children}</>;
}
