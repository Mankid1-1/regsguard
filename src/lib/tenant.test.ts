import { describe, it, expect, beforeEach } from "vitest";
import { slugFromHostname, tenantInitials, DEFAULT_TENANT } from "./tenant";

describe("slugFromHostname", () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_BASE_DOMAIN = "regsguard.com";
  });

  it("extracts subdomain from tenant.regsguard.com", () => {
    expect(slugFromHostname("acme.regsguard.com")).toBe("acme");
  });

  it("strips port from hostname", () => {
    expect(slugFromHostname("acme.regsguard.com:3000")).toBe("acme");
  });

  it("returns default for www subdomain", () => {
    expect(slugFromHostname("www.regsguard.com")).toBe("default");
  });

  it("returns default for bare domain", () => {
    expect(slugFromHostname("regsguard.com")).toBe("default");
  });

  it("returns default for localhost", () => {
    expect(slugFromHostname("localhost:3000")).toBe("default");
  });

  it("handles uppercase hostnames", () => {
    expect(slugFromHostname("ACME.REGSGUARD.COM")).toBe("acme");
  });

  it("returns default when no base domain configured", () => {
    delete process.env.NEXT_PUBLIC_BASE_DOMAIN;
    expect(slugFromHostname("anything.example.com")).toBe("default");
  });
});

describe("tenantInitials", () => {
  it("returns first two letters of initials", () => {
    expect(tenantInitials("Acme Plumbing")).toBe("AP");
  });

  it("handles single word names", () => {
    expect(tenantInitials("RegsGuard")).toBe("R");
  });

  it("handles three+ word names", () => {
    expect(tenantInitials("Big City Plumbing Co")).toBe("BC");
  });
});

describe("DEFAULT_TENANT", () => {
  it("has expected default values", () => {
    expect(DEFAULT_TENANT.slug).toBe("default");
    expect(DEFAULT_TENANT.primaryColor).toBe("#1e40af");
    expect(DEFAULT_TENANT.logoUrl).toBeNull();
  });
});
