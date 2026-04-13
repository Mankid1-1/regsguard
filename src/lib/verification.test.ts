import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the logger
vi.mock("@/lib/logger", () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

import { verifyLicense, verifyInsurance, verifyBond } from "./verification";

describe("verifyLicense", () => {
  beforeEach(() => {
    // Clear any license API keys so we get mock behavior
    delete process.env.LICENSE_API_KEY_CA;
    delete process.env.LICENSE_API_KEY_TX;
    delete process.env.LICENSE_API_KEY_FL;
    delete process.env.LICENSE_API_KEY_MN;
  });

  it('returns "verified" for a normal license number', async () => {
    const result = await verifyLicense("CA", "PLUMBING", "ABC12345");
    expect(result.status).toBe("verified");
    expect(result.licenseHolder).toBeDefined();
    expect(result.expirationDate).toBeDefined();
    expect(result.licenseType).toBe("PLUMBING");
    expect(result.source).toContain("California CSLB");
  });

  it('returns "not_found" for license numbers ending in "0"', async () => {
    const result = await verifyLicense("TX", "ELECTRICAL", "LIC99990");
    expect(result.status).toBe("not_found");
  });

  it('returns "expired" for license numbers ending in "X"', async () => {
    const result = await verifyLicense("FL", "HVAC", "FL-2024-00X");
    expect(result.status).toBe("expired");
    expect(result.licenseHolder).toBeDefined();
    expect(result.expirationDate).toBe("2024-12-31");
  });

  it('returns "expired" for license numbers ending in "Z"', async () => {
    const result = await verifyLicense("MN", "ROOFING", "MN-LICENSE-Z");
    expect(result.status).toBe("expired");
  });

  it("returns source with state board name when state is known", async () => {
    const result = await verifyLicense("CA", "GENERAL", "CA12345");
    expect(result.source).toContain("California CSLB");
  });

  it("returns generic source when state is unknown", async () => {
    const result = await verifyLicense("ZZ", "GENERAL", "ZZ99991");
    expect(result.source).toContain("ZZ Licensing Board");
  });
});

describe("verifyInsurance", () => {
  beforeEach(() => {
    delete process.env.INSURANCE_VERIFICATION_API_KEY;
    delete process.env.INSURANCE_VERIFICATION_API_URL;
  });

  it('returns "active" for a normal policy number', async () => {
    const result = await verifyInsurance("POL-12345");
    expect(result.status).toBe("active");
    expect(result.carrier).toBe("Mock Insurance Co.");
    expect(result.policyNumber).toBe("POL-12345");
    expect(result.coverageAmount).toBeDefined();
  });

  it('returns "expired" for policy numbers ending in "X"', async () => {
    const result = await verifyInsurance("POL-EXPIREDX");
    expect(result.status).toBe("expired");
  });

  it("uses provided carrier name", async () => {
    const result = await verifyInsurance("POL-123", "State Farm");
    expect(result.carrier).toBe("State Farm");
  });
});

describe("verifyBond", () => {
  beforeEach(() => {
    delete process.env.BOND_VERIFICATION_API_KEY;
    delete process.env.BOND_VERIFICATION_API_URL;
  });

  it('returns "active" for a normal bond number', async () => {
    const result = await verifyBond("BOND-999");
    expect(result.status).toBe("active");
    expect(result.surety).toBe("Mock Surety Co.");
    expect(result.bondNumber).toBe("BOND-999");
    expect(result.amount).toBe("$25,000");
  });

  it('returns "expired" for bond numbers ending in "X"', async () => {
    const result = await verifyBond("BOND-EXPX");
    expect(result.status).toBe("expired");
  });

  it("uses provided surety name", async () => {
    const result = await verifyBond("BOND-123", "Travelers");
    expect(result.surety).toBe("Travelers");
  });
});
