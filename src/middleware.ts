import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { slugFromHostname } from "@/lib/tenant";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/partners",
  "/offline",
  "/compliance/(.*)",
  "/api/webhooks/(.*)",
  "/api/health",
  "/api/stripe/webhook",
  "/api/regulations(.*)",
  "/api/partners(.*)",
  "/api/cron/(.*)",
  "/api/compliance/share/(.*)",
  "/api/calendar/ical/(.*)",
  "/api/license-verification/(.*)",
  "/stripe-checkout-mockup.html",
]);

// Token-gated signature routes: /api/documents/[id]/sign/[token]
const isSigningRoute = createRouteMatcher(["/api/documents/:id/sign/:token"]);

export default clerkMiddleware(async (auth, req) => {
  // Detect tenant from hostname
  const hostname = req.headers.get("host") || "";
  const tenantSlug = slugFromHostname(hostname);
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-tenant-slug", tenantSlug);
  requestHeaders.set("x-request-id", crypto.randomUUID());

  // Apply basic security headers to all responses
  const response = NextResponse.next({ request: { headers: requestHeaders } });
  
  // Content Security Policy to allow external scripts and connections
  const csp = [
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.clerk.accounts.dev https://*.clerk.com https://vercel.live",
    "connect-src 'self' https://api.stripe.com https://*.clerk.accounts.dev https://*.clerk.com https://clerk-telemetry.com",
    "img-src 'self' data: https: blob:",
    "font-src 'self' data:",
    "style-src 'self' 'unsafe-inline'",
    "worker-src 'self' blob:",
    "frame-src 'self' https://js.stripe.com https://*.clerk.accounts.dev https://challenges.cloudflare.com",
    "default-src 'self'"
  ].join('; ');
  
  response.headers.set('Content-Security-Policy', csp);
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Allow public and token-gated routes
  if (isPublicRoute(req) || isSigningRoute(req)) {
    return response;
  }

  // Protect all other routes - redirects to sign-in if not authenticated
  await auth.protect();

  return response;
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icons|manifest|sw\\.js|.*\\.png$).*)",
  ],
};
