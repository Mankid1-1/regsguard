/**
 * Request-scoped context using AsyncLocalStorage.
 *
 * Carries a correlation ID (requestId), optional userId, and tenantSlug
 * through the entire request lifecycle for structured logging and tracing.
 */

import { AsyncLocalStorage } from "node:async_hooks";

export interface RequestContext {
  requestId: string;
  userId?: string;
  tenantSlug?: string;
}

const storage = new AsyncLocalStorage<RequestContext>();

/**
 * Get the current request context, or undefined if not inside a request.
 */
export function getRequestContext(): RequestContext | undefined {
  return storage.getStore();
}

/**
 * Run a function within a request context.
 */
export function withRequestContext<T>(
  ctx: RequestContext,
  fn: () => T
): T {
  return storage.run(ctx, fn);
}
