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
  "/api/cron(.*)",
  "/api/compliance/share/(.*)",
  "/api/calendar/ical(.*)",
  "/api/license-verification(.*)",
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

  // Allow public and token-gated routes
  if (isPublicRoute(req) || isSigningRoute(req)) {
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  // Protect all other routes — redirects to sign-in if not authenticated
  await auth.protect();

  return NextResponse.next({ request: { headers: requestHeaders } });
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icons|manifest|sw\\.js|.*\\.png$).*)",
  ],
};
