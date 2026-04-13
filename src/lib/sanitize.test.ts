import { describe, it, expect } from "vitest";
import { sanitizeText, sanitizeObject } from "./sanitize";

describe("sanitizeText", () => {
  it("strips script tags and their contents", () => {
    expect(sanitizeText('hello<script>alert("xss")</script>world')).toBe(
      "helloworld"
    );
  });

  it("strips inline event handlers", () => {
    expect(sanitizeText('<img onerror="alert(1)" src=x>')).toBe("");
  });

  it("strips all HTML tags", () => {
    expect(sanitizeText("<b>bold</b> <i>italic</i>")).toBe("bold italic");
  });

  it("strips javascript: URIs", () => {
    expect(sanitizeText('javascript:alert("xss")')).toBe('alert("xss")');
  });

  it("strips data:text/html URIs", () => {
    expect(sanitizeText("data:text/html,<h1>xss</h1>")).toBe(",xss");
  });

  it("strips CSS expression()", () => {
    expect(sanitizeText("width:expression(alert(1))")).toBe("width:alert(1))");
  });

  it("handles mixed attack vectors", () => {
    const input =
      '<div onmouseover="steal()"><script>document.cookie</script><a href="javascript:void(0)">click</a>';
    const result = sanitizeText(input);
    expect(result).not.toContain("<script");
    expect(result).not.toContain("onmouseover");
    expect(result).not.toContain("javascript:");
  });

  it("preserves clean text", () => {
    expect(sanitizeText("Hello, this is a normal string!")).toBe(
      "Hello, this is a normal string!"
    );
  });

  it("preserves numbers and special characters", () => {
    expect(sanitizeText("$1,234.56 — 100% done")).toBe(
      "$1,234.56 — 100% done"
    );
  });

  it("trims whitespace", () => {
    expect(sanitizeText("  hello  ")).toBe("hello");
  });

  it("handles empty string", () => {
    expect(sanitizeText("")).toBe("");
  });
});

describe("sanitizeObject", () => {
  it("deep-sanitizes string values in objects", () => {
    const input = {
      name: "<b>Bold Name</b>",
      nested: { note: '<script>alert("xss")</script>safe text' },
    };
    const result = sanitizeObject(input);
    expect(result.name).toBe("Bold Name");
    expect(result.nested.note).toBe("safe text");
  });

  it("sanitizes arrays of strings", () => {
    const input = ["<b>one</b>", "<i>two</i>"];
    const result = sanitizeObject(input);
    expect(result).toEqual(["one", "two"]);
  });

  it("preserves non-string values", () => {
    const input = { count: 42, active: true, data: null };
    expect(sanitizeObject(input)).toEqual(input);
  });

  it("handles deeply nested structures", () => {
    const input = {
      a: { b: { c: { d: '<script>alert("deep")</script>safe' } } },
    };
    const result = sanitizeObject(input);
    expect(result.a.b.c.d).toBe("safe");
  });
});
