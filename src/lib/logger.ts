import { getRequestContext } from "@/lib/request-context";

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, unknown>;
  error?: { message: string; stack?: string };
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const MIN_LEVEL = LOG_LEVELS[(process.env.LOG_LEVEL as LogLevel) || "info"];

function formatEntry(entry: LogEntry): string {
  const reqCtx = getRequestContext();
  const reqId = reqCtx?.requestId ? `[req:${reqCtx.requestId.slice(0, 8)}] ` : "";
  const base = `[${entry.timestamp}] ${reqId}${entry.level.toUpperCase()} ${entry.message}`;
  const ctx = entry.context ? ` ${JSON.stringify(entry.context)}` : "";
  const err = entry.error ? ` | error=${entry.error.message}` : "";
  return `${base}${ctx}${err}`;
}

function log(level: LogLevel, message: string, context?: Record<string, unknown>, error?: Error) {
  if (LOG_LEVELS[level] < MIN_LEVEL) return;

  const entry: LogEntry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    context,
    error: error ? { message: error.message, stack: error.stack } : undefined,
  };

  const formatted = formatEntry(entry);

  switch (level) {
    case "debug":
      console.debug(formatted);
      break;
    case "info":
      console.info(formatted);
      break;
    case "warn":
      console.warn(formatted);
      break;
    case "error":
      console.error(formatted);
      break;
  }

  // In production, this is where you'd send to an external service
  // (Datadog, Logtail, Axiom, etc.)
  if (process.env.NODE_ENV === "production" && level === "error") {
    // Sentry captures errors separately, but we could also push to a log drain
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const Sentry = require("@sentry/nextjs");
      if (error) {
        Sentry.captureException(error, { extra: context });
      } else {
        Sentry.captureMessage(message, { level, extra: context });
      }
    } catch {
      // Sentry not installed — silent
    }
  }
}

export const logger = {
  debug: (message: string, context?: Record<string, unknown>) =>
    log("debug", message, context),
  info: (message: string, context?: Record<string, unknown>) =>
    log("info", message, context),
  warn: (message: string, context?: Record<string, unknown>) =>
    log("warn", message, context),
  error: (message: string, context?: Record<string, unknown>, error?: Error) =>
    log("error", message, context, error),
};
