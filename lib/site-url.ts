/**
 * Returns the current site URL for redirects. Uses window.location.origin in the
 * browser so it works for both local (localhost) and production without env config.
 * Falls back to NEXT_PUBLIC_SITE_URL on the server.
 */
export function getSiteUrl(): string {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}
