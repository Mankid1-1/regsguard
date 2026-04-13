import { describe, it, expect, beforeEach } from "vitest";
import { isEnabled, reloadFlags } from "./feature-flags";

describe("feature-flags", () => {
  beforeEach(() => {
    reloadFlags();
  });

  it("returns false for undefined flags", () => {
    process.env.FEATURE_FLAGS = "{}";
    reloadFlags();
    expect(isEnabled("nonexistent")).toBe(false);
  });

  it("returns true for enabled boolean flags", () => {
    process.env.FEATURE_FLAGS = '{"my-feature":true}';
    reloadFlags();
    expect(isEnabled("my-feature")).toBe(true);
  });

  it("returns false for disabled boolean flags", () => {
    process.env.FEATURE_FLAGS = '{"my-feature":false}';
    reloadFlags();
    expect(isEnabled("my-feature")).toBe(false);
  });

  it("supports percentage rollout with userId", () => {
    process.env.FEATURE_FLAGS = '{"gradual":0.5}';
    reloadFlags();

    // Test with many user IDs — ~50% should get the feature
    let enabled = 0;
    for (let i = 0; i < 100; i++) {
      if (isEnabled("gradual", `user-${i}`)) enabled++;
    }
    // Should be roughly 50% (allow wide margin for hash distribution)
    expect(enabled).toBeGreaterThan(20);
    expect(enabled).toBeLessThan(80);
  });

  it("returns false for percentage rollout without userId", () => {
    process.env.FEATURE_FLAGS = '{"gradual":0.5}';
    reloadFlags();
    expect(isEnabled("gradual")).toBe(false);
  });

  it("handles invalid JSON gracefully", () => {
    process.env.FEATURE_FLAGS = "not json";
    reloadFlags();
    expect(isEnabled("anything")).toBe(false);
  });

  it("handles missing env var", () => {
    delete process.env.FEATURE_FLAGS;
    reloadFlags();
    expect(isEnabled("anything")).toBe(false);
  });

  it("is deterministic for the same userId", () => {
    process.env.FEATURE_FLAGS = '{"test":0.5}';
    reloadFlags();
    const first = isEnabled("test", "user-abc");
    const second = isEnabled("test", "user-abc");
    expect(first).toBe(second);
  });
});
