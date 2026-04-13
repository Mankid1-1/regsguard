/**
 * Generic caching layer with Redis + in-memory fallback.
 *
 * Usage:
 *   const user = await cache.get("user:123", 120, () => db.user.findUnique(...));
 *   cache.invalidate("user:123");
 */

import { getRedis } from "@/lib/redis";

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

// In-memory fallback store (for single-instance / dev mode)
const memStore = new Map<string, CacheEntry<unknown>>();

// Cleanup stale memory entries every 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of memStore) {
      if (now > entry.expiresAt) memStore.delete(key);
    }
  }, 5 * 60 * 1000);
}

/**
 * Get a value from cache, or compute + cache it on miss.
 *
 * @param key      Cache key
 * @param ttlSec   Time-to-live in seconds
 * @param fetcher  Async function that produces the value on cache miss
 */
async function get<T>(
  key: string,
  ttlSec: number,
  fetcher: () => Promise<T>
): Promise<T> {
  const redis = getRedis();

  // Try Redis first
  if (redis) {
    try {
      const cached = await redis.get(`cache:${key}`);
      if (cached !== null) {
        return JSON.parse(cached) as T;
      }
    } catch {
      // Redis read failed — fall through to fetcher
    }
  } else {
    // In-memory fallback
    const entry = memStore.get(key);
    if (entry && Date.now() < entry.expiresAt) {
      return entry.value as T;
    }
  }

  // Cache miss — fetch fresh data
  const value = await fetcher();

  // Store in cache
  if (redis) {
    try {
      await redis.set(`cache:${key}`, JSON.stringify(value), "EX", ttlSec);
    } catch {
      // Redis write failed — still return the value
    }
  } else {
    memStore.set(key, { value, expiresAt: Date.now() + ttlSec * 1000 });
  }

  return value;
}

/**
 * Invalidate a specific cache key.
 */
async function invalidate(key: string): Promise<void> {
  const redis = getRedis();
  if (redis) {
    try {
      await redis.del(`cache:${key}`);
    } catch {
      // Best-effort invalidation
    }
  }
  memStore.delete(key);
}

/**
 * Invalidate all keys matching a prefix pattern.
 */
async function invalidatePrefix(prefix: string): Promise<void> {
  const redis = getRedis();
  if (redis) {
    try {
      const keys = await redis.keys(`cache:${prefix}*`);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } catch {
      // Best-effort invalidation
    }
  }
  for (const key of memStore.keys()) {
    if (key.startsWith(prefix)) memStore.delete(key);
  }
}

export const cache = { get, invalidate, invalidatePrefix };
