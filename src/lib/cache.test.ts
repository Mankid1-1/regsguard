import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock redis to return null (no Redis available — tests use in-memory)
vi.mock("@/lib/redis", () => ({
  getRedis: () => null,
}));

import { cache } from "./cache";

describe("cache", () => {
  beforeEach(() => {
    // Invalidate all known test keys
    cache.invalidate("test:key1");
    cache.invalidate("test:key2");
    cache.invalidate("test:prefix:a");
    cache.invalidate("test:prefix:b");
  });

  it("caches the result of a fetcher", async () => {
    let calls = 0;
    const fetcher = async () => {
      calls++;
      return { value: 42 };
    };

    const result1 = await cache.get("test:key1", 60, fetcher);
    const result2 = await cache.get("test:key1", 60, fetcher);

    expect(result1).toEqual({ value: 42 });
    expect(result2).toEqual({ value: 42 });
    expect(calls).toBe(1); // Fetcher called only once
  });

  it("returns fresh data after invalidation", async () => {
    let counter = 0;
    const fetcher = async () => ++counter;

    await cache.get("test:key2", 60, fetcher);
    await cache.invalidate("test:key2");
    const result = await cache.get("test:key2", 60, fetcher);

    expect(result).toBe(2); // Fetcher called again
  });

  it("invalidates by prefix", async () => {
    await cache.get("test:prefix:a", 60, async () => "a");
    await cache.get("test:prefix:b", 60, async () => "b");

    await cache.invalidatePrefix("test:prefix:");

    let callsA = 0;
    let callsB = 0;
    await cache.get("test:prefix:a", 60, async () => { callsA++; return "a2"; });
    await cache.get("test:prefix:b", 60, async () => { callsB++; return "b2"; });

    expect(callsA).toBe(1);
    expect(callsB).toBe(1);
  });

  it("handles fetcher errors by propagating them", async () => {
    await expect(
      cache.get("test:error", 60, async () => {
        throw new Error("fetcher failed");
      })
    ).rejects.toThrow("fetcher failed");
  });
});
