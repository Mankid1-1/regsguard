import { describe, it, expect } from "vitest";
import { calculateNextDueDate } from "./deadline-calculator";

describe("calculateNextDueDate", () => {
  const baseRegulation = {
    id: "reg1",
    renewalCycle: "ANNUAL" as const,
    defaultDueMonth: null as number | null,
    defaultDueDay: null as number | null,
  };

  it("calculates annual renewal from last completed date", () => {
    const result = calculateNextDueDate(
      { ...baseRegulation, renewalCycle: "ANNUAL" },
      new Date(2025, 5, 15) // June 15, local time
    );
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth()).toBe(5); // June (0-indexed)
    expect(result.getDate()).toBe(15);
  });

  it("calculates biennial renewal", () => {
    const result = calculateNextDueDate(
      { ...baseRegulation, renewalCycle: "BIENNIAL" },
      new Date(2025, 2, 1) // March 1, local time
    );
    expect(result.getFullYear()).toBe(2027);
  });

  it("calculates triennial renewal", () => {
    const result = calculateNextDueDate(
      { ...baseRegulation, renewalCycle: "TRIENNIAL" },
      new Date(2025, 0, 15) // local time to avoid UTC edge case
    );
    expect(result.getFullYear()).toBe(2028);
  });

  it("calculates five-year renewal", () => {
    const result = calculateNextDueDate(
      { ...baseRegulation, renewalCycle: "FIVE_YEAR" },
      new Date(2025, 0, 15) // local time to avoid UTC edge case
    );
    expect(result.getFullYear()).toBe(2030);
  });

  it("uses default due month/day when no completed date", () => {
    const result = calculateNextDueDate(
      { ...baseRegulation, defaultDueMonth: 3, defaultDueDay: 15 },
      undefined
    );
    // Should be March 15 of next year or this year
    expect(result.getMonth()).toBe(2); // March (0-indexed)
    expect(result.getDate()).toBe(15);
  });

  it("falls back to 1 year from now with no completed date or defaults", () => {
    const now = new Date();
    const result = calculateNextDueDate(baseRegulation, undefined);
    const diffDays = Math.abs(
      (result.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );
    // Should be roughly 365 days from now
    expect(diffDays).toBeGreaterThan(360);
    expect(diffDays).toBeLessThan(370);
  });

  it("handles ONE_TIME cycle", () => {
    const result = calculateNextDueDate(
      { ...baseRegulation, renewalCycle: "ONE_TIME", defaultDueMonth: 12, defaultDueDay: 31 },
      undefined
    );
    // Should still return a valid date
    expect(result).toBeInstanceOf(Date);
  });
});
