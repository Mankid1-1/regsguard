import { NextResponse } from "next/server";
import { getRedis } from "@/lib/redis";

// ─── Store Interface ───

interface RateLimitStore {
  increment(key: string, windowMs: number): Promise<{ count: number; resetAt: number }>;
}

// ─── In-Memory Store (single-instance / dev fallback) ───

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const memMap = new Map<string, RateLimitEntry>();

if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of memMap) {
      if (now > entry.resetAt) memMap.delete(key);
    }
  }, 5 * 60 * 1000);
}

class InMemoryStore implements RateLimitStore {
  async increment(key: string, windowMs: number) {
    const now = Date.now();
    let entry = memMap.get(key);

    if (!entry || now > entry.resetAt) {
      entry = { count: 0, resetAt: now + windowMs };
      memMap.set(key, entry);
    }

    entry.count++;
    return { count: entry.count, resetAt: entry.resetAt };
  }
}

// ─── Redis Store (multi-instance production) ───

class RedisStore implements RateLimitStore {
  async increment(key: string, windowMs: number) {
    const redis = getRedis()!;
    const redisKey = `rl:${key}`;
    const ttlSec = Math.ceil(windowMs / 1000);

    const count = await redis.incr(redisKey);
    if (count === 1) {
      await redis.expire(redisKey, ttlSec);
    }

    const ttl = await redis.ttl(redisKey);
    const resetAt = Date.now() + ttl * 1000;

    return { count, resetAt };
  }
}

// ─── Store Selection ───

function getStore(): RateLimitStore {
  return getRedis() ? new RedisStore() : new InMemoryStore();
}

// ─── Public API (unchanged signatures) ───

interface RateLimitOptions {
  /** Max requests in the window */
  limit?: number;
  /** Window size in seconds */
  windowSec?: number;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

/**
 * Check rate limit for a given key (usually IP or userId).
 */
export async function checkRateLimit(
  key: string,
  options?: RateLimitOptions
): Promise<RateLimitResult> {
  const limit = options?.limit ?? 60;
  const windowMs = (options?.windowSec ?? 60) * 1000;

  const store = getStore();
  const { count, resetAt } = await store.increment(key, windowMs);

  return {
    allowed: count <= limit,
    remaining: Math.max(0, limit - count),
    resetAt,
  };
}

/**
 * Helper to apply rate limiting in an API route.
 * Returns a NextResponse (429) if rate-limited, or null if allowed.
 */
export async function rateLimit(
  identifier: string,
  options?: RateLimitOptions
): Promise<NextResponse | null> {
  const result = await checkRateLimit(identifier, options);

  if (!result.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil((result.resetAt - Date.now()) / 1000)),
          "X-RateLimit-Limit": String(options?.limit ?? 60),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(Math.ceil(result.resetAt / 1000)),
        },
      }
    );
  }

  return null;
}
