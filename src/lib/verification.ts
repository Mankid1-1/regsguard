import { logger } from "@/lib/logger";

// ─── License Verification ───

interface LicenseVerificationResult {
  status: "verified" | "expired" | "not_found" | "error";
  licenseHolder?: string;
  expirationDate?: string;
  issueDate?: string;
  licenseType?: string;
  source: string;
}

/**
 * State board API configurations.
 * In production, each state has its own API endpoint and format.
 */
const STATE_BOARD_APIS: Record<string, { name: string; baseUrl: string }> = {
  CA: { name: "California CSLB", baseUrl: "https://www2.cslb.ca.gov/OnlineServices/CheckLicenseII" },
  TX: { name: "Texas TDLR", baseUrl: "https://www.tdlr.texas.gov/LicenseSearch" },
  FL: { name: "Florida DBPR", baseUrl: "https://www.myfloridalicense.com/wl11.asp" },
  MN: { name: "Minnesota DLI", baseUrl: "https://www.dli.mn.gov/workers/contractor-licensing" },
  WI: { name: "Wisconsin DSPS", baseUrl: "https://licensesearch.wi.gov" },
};

/**
 * Verify a contractor license with the appropriate state board.
 *
 * In production, this would make real HTTP requests to state board APIs.
 * Currently implements a deterministic mock with realistic response shapes
 * since most state boards don't offer programmatic APIs.
 */
export async function verifyLicense(
  state: string,
  trade: string,
  licenseNumber: string
): Promise<LicenseVerificationResult> {
  const board = STATE_BOARD_APIS[state.toUpperCase()];
  const source = board?.name || `${state.toUpperCase()} Licensing Board`;

  logger.info("License verification request", { state, trade, licenseNumber, source });

  // Check if a real verification API is configured for this state
  const apiKey = process.env[`LICENSE_API_KEY_${state.toUpperCase()}`];

  if (apiKey && board) {
    try {
      // Real API call would go here per state
      // Each state has a different API format, so this would need
      // state-specific adapters
      const response = await fetch(`${board.baseUrl}/api/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({ licenseNumber, trade }),
        signal: AbortSignal.timeout(10000),
      });

      if (response.ok) {
        const data = await response.json();
        return {
          status: data.active ? "verified" : "expired",
          licenseHolder: data.name,
          expirationDate: data.expirationDate,
          issueDate: data.issueDate,
          licenseType: data.licenseType,
          source,
        };
      }
    } catch (err) {
      logger.warn("License API call failed, falling back to mock", {
        state,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  // Deterministic mock based on license number for development/testing
  const lastChar = licenseNumber.slice(-1).toUpperCase();
  const hash = licenseNumber.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0);

  if (lastChar === "0") {
    return { status: "not_found", source };
  }

  if (lastChar === "X" || lastChar === "Z") {
    return {
      status: "expired",
      licenseHolder: `License Holder #${hash % 10000}`,
      expirationDate: "2024-12-31",
      issueDate: "2020-01-15",
      licenseType: trade,
      source: `${source} (mock)`,
    };
  }

  const expDate = new Date();
  expDate.setFullYear(expDate.getFullYear() + 1);

  return {
    status: "verified",
    licenseHolder: `License Holder #${hash % 10000}`,
    expirationDate: expDate.toISOString().split("T")[0],
    issueDate: "2022-06-01",
    licenseType: trade,
    source: `${source} (mock)`,
  };
}

// ─── Insurance Verification ───

interface InsuranceVerificationResult {
  status: "active" | "expired" | "not_found" | "error";
  carrier?: string;
  policyNumber?: string;
  effectiveDate?: string;
  expirationDate?: string;
  coverageAmount?: string;
  source: string;
}

/**
 * Verify insurance coverage.
 *
 * In production, this would integrate with insurance verification services like:
 * - ACORD eSLIP
 * - myCOI
 * - Evident
 * - Jones
 */
export async function verifyInsurance(
  policyNumber: string,
  carrier?: string
): Promise<InsuranceVerificationResult> {
  const apiKey = process.env.INSURANCE_VERIFICATION_API_KEY;
  const apiUrl = process.env.INSURANCE_VERIFICATION_API_URL;

  logger.info("Insurance verification request", { policyNumber, carrier });

  if (apiKey && apiUrl) {
    try {
      const response = await fetch(`${apiUrl}/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({ policyNumber, carrier }),
        signal: AbortSignal.timeout(10000),
      });

      if (response.ok) {
        const data = await response.json();
        return {
          status: data.active ? "active" : "expired",
          carrier: data.carrier,
          policyNumber: data.policyNumber,
          effectiveDate: data.effectiveDate,
          expirationDate: data.expirationDate,
          coverageAmount: data.coverageAmount,
          source: "Insurance Verification API",
        };
      }
    } catch (err) {
      logger.warn("Insurance API call failed, falling back to mock", {
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  // Mock response for development
  const hash = policyNumber.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const expDate = new Date();
  expDate.setMonth(expDate.getMonth() + 6);

  return {
    status: policyNumber.endsWith("X") ? "expired" : "active",
    carrier: carrier || "Mock Insurance Co.",
    policyNumber,
    effectiveDate: "2025-01-01",
    expirationDate: expDate.toISOString().split("T")[0],
    coverageAmount: `$${(hash % 5 + 1) * 500000}`,
    source: "Mock (configure INSURANCE_VERIFICATION_API_KEY for real verification)",
  };
}

// ─── Bond Verification ───

interface BondVerificationResult {
  status: "active" | "expired" | "not_found" | "error";
  surety?: string;
  bondNumber?: string;
  amount?: string;
  effectiveDate?: string;
  expirationDate?: string;
  source: string;
}

/**
 * Verify a surety bond.
 *
 * In production, this would integrate with surety verification services.
 */
export async function verifyBond(
  bondNumber: string,
  surety?: string
): Promise<BondVerificationResult> {
  const apiKey = process.env.BOND_VERIFICATION_API_KEY;
  const apiUrl = process.env.BOND_VERIFICATION_API_URL;

  logger.info("Bond verification request", { bondNumber, surety });

  if (apiKey && apiUrl) {
    try {
      const response = await fetch(`${apiUrl}/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({ bondNumber, surety }),
        signal: AbortSignal.timeout(10000),
      });

      if (response.ok) {
        const data = await response.json();
        return {
          status: data.active ? "active" : "expired",
          surety: data.surety,
          bondNumber: data.bondNumber,
          amount: data.amount,
          effectiveDate: data.effectiveDate,
          expirationDate: data.expirationDate,
          source: "Bond Verification API",
        };
      }
    } catch (err) {
      logger.warn("Bond API call failed, falling back to mock", {
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  // Mock response for development
  const expDate = new Date();
  expDate.setFullYear(expDate.getFullYear() + 1);

  return {
    status: bondNumber.endsWith("X") ? "expired" : "active",
    surety: surety || "Mock Surety Co.",
    bondNumber,
    amount: "$25,000",
    effectiveDate: "2025-01-01",
    expirationDate: expDate.toISOString().split("T")[0],
    source: "Mock (configure BOND_VERIFICATION_API_KEY for real verification)",
  };
}
