"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { analytics } from "@/lib/analytics";
import { reportWebVitals } from "@/lib/web-vitals";

/**
 * Analytics provider — tracks page views, identifies users,
 * and reports Web Vitals.
 *
 * Add to the root layout inside ClerkProvider.
 */
export function AnalyticsProvider() {
  const pathname = usePathname();
  const { user, isSignedIn } = useUser();

  // Identify user when signed in
  useEffect(() => {
    if (isSignedIn && user) {
      analytics.identify(user.id, {
        email: user.primaryEmailAddress?.emailAddress,
        name: user.fullName,
      });
    }
  }, [isSignedIn, user]);

  // Track page views on route change
  useEffect(() => {
    analytics.page(pathname);
  }, [pathname]);

  // Report Web Vitals once on mount
  useEffect(() => {
    reportWebVitals();
  }, []);

  return null;
}
