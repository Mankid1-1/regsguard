import { describe, it, expect } from "vitest";
import { parsePaginationParams, buildPrismaArgs, buildPaginatedResponse } from "./pagination";

describe("parsePaginationParams", () => {
  it("parses cursor and limit from search params", () => {
    const params = new URLSearchParams("cursor=abc123&limit=10");
    const result = parsePaginationParams(params);
    expect(result.cursor).toBe("abc123");
    expect(result.take).toBe(10);
  });

  it("uses defaults when params are missing", () => {
    const params = new URLSearchParams("");
    const result = parsePaginationParams(params);
    expect(result.cursor).toBeUndefined();
    expect(result.take).toBe(25);
  });

  it("enforces max take limit", () => {
    const params = new URLSearchParams("limit=999");
    const result = parsePaginationParams(params, 25, 100);
    expect(result.take).toBe(100);
  });

  it("uses custom default take", () => {
    const params = new URLSearchParams("");
    const result = parsePaginationParams(params, 50);
    expect(result.take).toBe(50);
  });

  it("handles invalid limit values", () => {
    const params = new URLSearchParams("limit=abc");
    const result = parsePaginationParams(params);
    expect(result.take).toBe(25);
  });

  it("handles negative limit values", () => {
    const params = new URLSearchParams("limit=-5");
    const result = parsePaginationParams(params);
    expect(result.take).toBe(25);
  });
});

describe("buildPrismaArgs", () => {
  it("builds args without cursor", () => {
    const args = buildPrismaArgs(undefined, 25);
    expect(args.take).toBe(26); // take+1 for hasMore detection
    expect(args).not.toHaveProperty("cursor");
  });

  it("builds args with cursor", () => {
    const args = buildPrismaArgs("abc123", 25);
    expect(args.take).toBe(26);
    expect(args.cursor).toEqual({ id: "abc123" });
    expect(args.skip).toBe(1);
  });
});

describe("buildPaginatedResponse", () => {
  it("indicates hasMore when extra item exists", () => {
    const items = Array.from({ length: 26 }, (_, i) => ({
      id: `item${i}`,
    }));
    const result = buildPaginatedResponse(items, 25);
    expect(result.hasMore).toBe(true);
    expect(result.data.length).toBe(25);
    expect(result.nextCursor).toBe("item24");
  });

  it("indicates no more when items <= take", () => {
    const items = [{ id: "item1" }, { id: "item2" }];
    const result = buildPaginatedResponse(items, 25);
    expect(result.hasMore).toBe(false);
    expect(result.data.length).toBe(2);
    expect(result.nextCursor).toBeNull();
  });

  it("handles empty results", () => {
    const result = buildPaginatedResponse([], 25);
    expect(result.hasMore).toBe(false);
    expect(result.data.length).toBe(0);
    expect(result.nextCursor).toBeNull();
  });
});
