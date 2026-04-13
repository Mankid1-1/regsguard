/**
 * Redis client singleton.
 *
 * Uses the same global-caching pattern as prisma.ts to avoid
 * creating multiple connections in development hot-reloads.
 *
 * Returns `null` when REDIS_URL is not configured, allowing the
 * entire app to work without Redis (single-instance mode).
 */

import type Redis from "ioredis";

const globalForRedis = globalThis as unknown as { redis: Redis | null };

function createClient(): Redis | null {
  const url = process.env.REDIS_URL;
  if (!url) return null;

  try {
    // Dynamic import keeps ioredis optional at install time
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const IORedis = require("ioredis") as typeof import("ioredis").default;
    const client = new IORedis(url, {
      maxRetriesPerRequest: 3,
      lazyConnect: true,
      enableReadyCheck: true,
    });

    client.on("error", (err) => {
      console.error("[Redis] Connection error:", err.message);
    });

    client.connect().catch(() => {
      // Silently handled — the app can run without Redis
    });

    return client;
  } catch {
    return null;
  }
}

/**
 * Get the shared Redis client, or `null` if Redis is not configured.
 */
export function getRedis(): Redis | null {
  if (!globalForRedis.redis) {
    globalForRedis.redis = createClient();
  }
  return globalForRedis.redis;
}
