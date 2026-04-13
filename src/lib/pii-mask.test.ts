import { describe, it, expect } from "vitest";
import { maskPii } from "./pii-mask";

describe("maskPii", () => {
  it("masks email addresses", () => {
    const result = maskPii({ sentTo: "john.doe@example.com" });
    expect(result.sentTo).toBe("j***@example.com");
  });

  it("masks recipientEmail", () => {
    const result = maskPii({ recipientEmail: "alice@company.org" });
    expect(result.recipientEmail).toBe("a***@company.org");
  });

  it("masks phone numbers keeping last 4 digits", () => {
    const result = maskPii({ recipientPhone: "+15551234567" });
    expect(result.recipientPhone).toBe("***-***-4567");
  });

  it("masks generic sensitive fields", () => {
    const result = maskPii({ taxId: "12-3456789" });
    expect(result.taxId).not.toBe("12-3456789");
    expect(result.taxId).toContain("*");
  });

  it("preserves non-sensitive keys", () => {
    const result = maskPii({
      action: "DEADLINE_COMPLETED",
      regulationId: "clxyz123",
      count: 42,
    });
    expect(result.action).toBe("DEADLINE_COMPLETED");
    expect(result.regulationId).toBe("clxyz123");
    expect(result.count).toBe(42);
  });

  it("handles nested objects", () => {
    const result = maskPii({
      outer: { email: "test@test.com", safe: "hello" },
    });
    const nested = result.outer as Record<string, unknown>;
    expect(nested.email).toBe("t***@test.com");
    expect(nested.safe).toBe("hello");
  });

  it("preserves arrays unchanged", () => {
    const result = maskPii({ tags: ["a", "b", "c"] });
    expect(result.tags).toEqual(["a", "b", "c"]);
  });

  it("handles empty objects", () => {
    expect(maskPii({})).toEqual({});
  });

  it("handles short emails", () => {
    const result = maskPii({ email: "@x.com" });
    expect(result.email).toBe("***");
  });

  it("handles short phone numbers", () => {
    const result = maskPii({ phone: "12" });
    expect(result.phone).toBe("***");
  });
});
