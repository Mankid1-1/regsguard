// This file configures Sentry for the client-side.
// The config is loaded automatically by @sentry/nextjs.

import * as Sentry from "@sentry/nextjs";

if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    environment: process.env.NODE_ENV,

    // Performance monitoring
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

    // Session replay for debugging
    replaysSessionSampleRate: 0.01,
    replaysOnErrorSampleRate: 1.0,

    // Don't send PII
    sendDefaultPii: false,

    // Filter out noisy errors
    ignoreErrors: [
      "ResizeObserver loop",
      "Non-Error exception captured",
      "Network request failed",
      "Load failed",
      "ChunkLoadError",
    ],
  });
}
