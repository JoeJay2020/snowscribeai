/**
 * Validates post-login redirect targets to prevent open redirects.
 */
export function getSafeRedirectPath(
  value: string | null | undefined,
  fallback = "/dashboard"
): string {
  if (!value) return fallback;
  const trimmed = value.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) return fallback;
  if (trimmed.includes("://")) return fallback;
  return trimmed;
}

export function loginHrefForPath(path: string): string {
  return `/login?redirect=${encodeURIComponent(path)}`;
}
