// This file configures Sentry for the server-side.
// The config is loaded automatically by @sentry/nextjs.

import * as Sentry from "@sentry/nextjs";

if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,

    // Performance monitoring
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.2 : 1.0,

    // Don't send PII
    sendDefaultPii: false,
  });
}
