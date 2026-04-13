import { describe, it, expect } from "vitest";
import { checkRateLimit, rateLimit } from "./rate-limit";

describe("checkRateLimit", () => {
  // Each test uses a unique key so they don't interfere with each other

  it("allows requests within the limit", async () => {
    const key = `test-allow-${Date.now()}`;
    const result = await checkRateLimit(key, { limit: 5, windowSec: 60 });
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(4);
  });

  it("blocks requests exceeding the limit", async () => {
    const key = `test-block-${Date.now()}`;
    for (let i = 0; i < 3; i++) {
      await checkRateLimit(key, { limit: 3, windowSec: 60 });
    }
    const result = await checkRateLimit(key, { limit: 3, windowSec: 60 });
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it("tracks different keys independently", async () => {
    const keyA = `test-indep-a-${Date.now()}`;
    const keyB = `test-indep-b-${Date.now()}`;

    // Exhaust key A
    for (let i = 0; i < 2; i++) {
      await checkRateLimit(keyA, { limit: 2, windowSec: 60 });
    }
    const resultA = await checkRateLimit(keyA, { limit: 2, windowSec: 60 });

    // Key B should still have capacity
    const resultB = await checkRateLimit(keyB, { limit: 2, windowSec: 60 });

    expect(resultA.allowed).toBe(false);
    expect(resultB.allowed).toBe(true);
    expect(resultB.remaining).toBe(1);
  });

  it("uses default limit of 60 when no options provided", async () => {
    const key = `test-default-${Date.now()}`;
    const result = await checkRateLimit(key);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(59);
  });
});

describe("rateLimit", () => {
  it("returns null when requests are within limit", async () => {
    const key = `rl-allowed-${Date.now()}`;
    const response = await rateLimit(key, { limit: 10, windowSec: 60 });
    expect(response).toBeNull();
  });

  it("returns a 429 NextResponse when limit is exceeded", async () => {
    const key = `rl-blocked-${Date.now()}`;
    for (let i = 0; i < 5; i++) {
      await rateLimit(key, { limit: 5, windowSec: 60 });
    }
    const response = await rateLimit(key, { limit: 5, windowSec: 60 });
    expect(response).not.toBeNull();
    expect(response!.status).toBe(429);
  });
});
