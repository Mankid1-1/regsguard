import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { slugFromHostname } from "@/lib/tenant";
import { securityHeaders, CSRFProtection, RateLimiter, SecurityUtils } from "@/lib/security";

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

  // Apply security headers to all responses
  const response = NextResponse.next({ request: { headers: requestHeaders } });
  
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  // Rate limiting for API endpoints
  if (req.url.includes('/api/') && !isPublicRoute(req)) {
    const identifier = RateLimiter.getIdentifier(req);
    const rateLimit = RateLimiter.isAllowed(identifier, 100, 60000); // 100 requests per minute
    
    if (!rateLimit.allowed) {
      return new NextResponse(
        JSON.stringify({ 
          error: 'Rate limit exceeded',
          retryAfter: Math.ceil((rateLimit.resetTime - Date.now()) / 1000)
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': '100',
            'X-RateLimit-Remaining': rateLimit.remaining.toString(),
            'X-RateLimit-Reset': rateLimit.resetTime.toString(),
          },
        }
      );
    }
    
    // Add rate limit headers
    response.headers.set('X-RateLimit-Limit', '100');
    response.headers.set('X-RateLimit-Remaining', rateLimit.remaining.toString());
    response.headers.set('X-RateLimit-Reset', rateLimit.resetTime.toString());
  }

  // CSRF protection for state-changing requests
  const csrfCheck = csrfProtectionMiddleware(req);
  if (csrfCheck) {
    return csrfCheck;
  }

  // Generate and set CSRF token for GET requests
  if (req.method === 'GET' && !isPublicRoute(req)) {
    const token = CSRFProtection.generateToken();
    response.headers.set('Set-Cookie', CSRFProtection.setCookie(token));
    response.headers.set('X-CSRF-Token', token);
  }

  // Bot detection and blocking for sensitive endpoints
  if (SecurityUtils.isBot(req) && req.url.includes('/api/')) {
    return new NextResponse(
      JSON.stringify({ error: 'Automated requests not allowed' }),
      {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

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
