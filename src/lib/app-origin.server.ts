/**
 * Server-only utility for resolving the canonical app URL.
 * Centralizes app-origin logic and ensures all public URLs point to the right host.
 */

import { headers } from "next/headers";

export function getAppOrigin(): string {
  const env = process.env.NEXT_PUBLIC_APP_URL;
  if (env && env.trim()) {
    return env.trim();
  }

  // Production fallback: use canonical Vercel host
  if (process.env.NODE_ENV === "production") {
    return "https://regsguard.vercel.app";
  }

  // Development fallback
  return "http://localhost:3000";
}

export async function getAppOriginFromRequest(): Promise<string> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-proto");
  const host = h.get("x-forwarded-host") || h.get("host");

  if (forwarded && host) {
    const protocol = forwarded.split(",")[0].trim();
    const hostname = host.split(",")[0].trim();
    return `${protocol}://${hostname}`;
  }

  return getAppOrigin();
}

/**
 * Build a fully-qualified URL for sharing, email, calendar, etc.
 * Always resolves to the canonical production host, never preview/staging.
 */
export function buildCanonicalUrl(path: string): string {
  const origin = getAppOrigin();
  return `${origin}${path.startsWith("/") ? path : `/${path}`}`;
}
