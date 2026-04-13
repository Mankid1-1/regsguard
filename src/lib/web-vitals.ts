"use client";

/**
 * Core Web Vitals reporting.
 *
 * Reports LCP, FID, CLS, FCP, TTFB to analytics and/or console.
 * Uses the web-vitals library (built into Next.js).
 */

type MetricName = "CLS" | "FCP" | "FID" | "INP" | "LCP" | "TTFB";

interface WebVitalMetric {
  name: MetricName;
  value: number;
  rating: "good" | "needs-improvement" | "poor";
  id: string;
}

function sendToAnalytics(metric: WebVitalMetric) {
  const body = {
    name: metric.name,
    value: Math.round(metric.name === "CLS" ? metric.value * 1000 : metric.value),
    rating: metric.rating,
    id: metric.id,
    page: typeof window !== "undefined" ? window.location.pathname : "",
  };

  // Log in development
  if (process.env.NODE_ENV !== "production") {
    console.debug(`[WebVital] ${body.name}: ${body.value} (${body.rating})`);
  }

  // Send to PostHog (or any analytics provider)
  try {
    const posthog = (window as unknown as Record<string, unknown>).posthog;
    if (posthog && typeof (posthog as Record<string, unknown>).capture === "function") {
      (posthog as { capture: (event: string, props: unknown) => void }).capture("web_vital", body);
    }
  } catch {
    // Silent fail
  }

  // Beacon API fallback for reliable delivery
  if (process.env.NEXT_PUBLIC_VITALS_ENDPOINT) {
    try {
      navigator.sendBeacon(
        process.env.NEXT_PUBLIC_VITALS_ENDPOINT,
        JSON.stringify(body)
      );
    } catch {
      // Silent fail
    }
  }
}

/**
 * Initialize Web Vitals reporting.
 * Call once in the root layout or a client component.
 */
export function reportWebVitals() {
  if (typeof window === "undefined") return;

  // Next.js exposes web-vitals through its instrumentation
  // We hook into the Performance Observer API directly
  try {
    // CLS
    const clsObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const e = entry as PerformanceEntry & { value?: number; hadRecentInput?: boolean };
        if (e.hadRecentInput) continue;
        sendToAnalytics({
          name: "CLS",
          value: e.value ?? 0,
          rating: (e.value ?? 0) <= 0.1 ? "good" : (e.value ?? 0) <= 0.25 ? "needs-improvement" : "poor",
          id: `cls-${Date.now()}`,
        });
      }
    });
    clsObserver.observe({ type: "layout-shift", buffered: true });

    // LCP
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const last = entries[entries.length - 1];
      if (last) {
        const value = last.startTime;
        sendToAnalytics({
          name: "LCP",
          value,
          rating: value <= 2500 ? "good" : value <= 4000 ? "needs-improvement" : "poor",
          id: `lcp-${Date.now()}`,
        });
      }
    });
    lcpObserver.observe({ type: "largest-contentful-paint", buffered: true });

    // FCP
    const fcpObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name === "first-contentful-paint") {
          const value = entry.startTime;
          sendToAnalytics({
            name: "FCP",
            value,
            rating: value <= 1800 ? "good" : value <= 3000 ? "needs-improvement" : "poor",
            id: `fcp-${Date.now()}`,
          });
        }
      }
    });
    fcpObserver.observe({ type: "paint", buffered: true });

    // TTFB
    const navEntries = performance.getEntriesByType("navigation");
    if (navEntries.length > 0) {
      const nav = navEntries[0] as PerformanceNavigationTiming;
      const value = nav.responseStart - nav.requestStart;
      sendToAnalytics({
        name: "TTFB",
        value,
        rating: value <= 800 ? "good" : value <= 1800 ? "needs-improvement" : "poor",
        id: `ttfb-${Date.now()}`,
      });
    }
  } catch {
    // PerformanceObserver not supported — silent
  }
}
