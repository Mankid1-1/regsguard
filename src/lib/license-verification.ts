/**
 * Unified License Verification Service
 * Combines Minnesota and Wisconsin state APIs for real-time license verification
 */

import { verifyMinnesotaLicense, type MinnesotaLicenseResult } from './state-apis/minnesota-licenses';
import { verifyWisconsinLicense, type WisconsinLicenseResult } from './state-apis/wisconsin-licenses';

export type LicenseVerificationResult = MinnesotaLicenseResult | WisconsinLicenseResult;

export interface LicenseVerificationRequest {
  licenseNumber: string;
  state: 'MN' | 'WI';
  trade: 'CONTRACTOR' | 'ELECTRICAL' | 'PLUMBING' | 'HVAC';
  licenseType?: string;
}

/**
 * Verify license across all supported states
 */
export async function verifyLicense(request: LicenseVerificationRequest): Promise<{
  success: boolean;
  result?: LicenseVerificationResult;
  error?: string;
  mode: 'live' | 'simulated';
}> {
  try {
    let result: LicenseVerificationResult;

    switch (request.state) {
      case 'MN':
        result = await verifyMinnesotaLicense(request.licenseNumber, request.trade, request.licenseType);
        break;
      case 'WI':
        result = await verifyWisconsinLicense(request.licenseNumber, request.trade, request.licenseType);
        break;
      default:
        throw new Error(`Unsupported state: ${request.state}`);
    }

    return {
      success: true,
      result,
      mode: 'live'
    };
  } catch (error) {
    console.error(`License verification failed for ${request.licenseNumber}:`, error);
    
    // Return simulated result if API fails
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      mode: 'simulated',
      result: getSimulatedResult(request)
    };
  }
}

/**
 * Get simulated result for fallback scenarios
 */
function getSimulatedResult(request: LicenseVerificationRequest): LicenseVerificationResult {
  const now = new Date();
  const expirationDate = new Date(now);
  expirationDate.setFullYear(expirationDate.getFullYear() + 2); // Assume 2-year renewal

  return {
    licenseNumber: request.licenseNumber,
    status: 'ACTIVE',
    issueDate: new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000), // 1 year ago
    expirationDate,
    licenseType: `${request.trade} - ${request.licenseType || 'STANDARD'}`,
    fullName: 'Simulated Data',
    businessName: 'Simulated Business',
    address: '123 Main St',
    city: request.state === 'MN' ? 'Minneapolis' : 'Milwaukee',
    state: request.state,
    zip: request.state === 'MN' ? '55401' : '53201',
    verifiedAt: now,
    source: request.state === 'MN' ? 'MN_DLI' : 'WI_DSPS'
  };
}

/**
 * Batch verify multiple licenses
 */
export async function verifyLicensesBatch(requests: LicenseVerificationRequest[]): Promise<{
  results: Array<{
    request: LicenseVerificationRequest;
    verification: ReturnType<typeof verifyLicense>;
  }>;
  summary: {
    total: number;
    successful: number;
    failed: number;
    live: number;
    simulated: number;
  };
}> {
  const results = await Promise.allSettled(
    requests.map(request => verifyLicense(request))
  );

  const processed = results.map((result, index) => ({
    request: requests[index],
    verification: result.status === 'fulfilled' ? result.value : {
      success: false,
      error: result.reason instanceof Error ? result.reason.message : 'Unknown error',
      mode: 'simulated' as const,
      result: getSimulatedResult(requests[index])
    }
  }));

  const summary = {
    total: processed.length,
    successful: processed.filter(r => r.verification.success).length,
    failed: processed.filter(r => !r.verification.success).length,
    live: processed.filter(r => r.verification.mode === 'live').length,
    simulated: processed.filter(r => r.verification.mode === 'simulated').length,
  };

  return { results: processed, summary };
}

/**
 * Check if license verification APIs are configured
 */
export function getVerificationConfiguration(): {
  minnesota: {
    dli: boolean;
    electrical: boolean;
    plumbing: boolean;
    hvac: boolean;
  };
  wisconsin: {
    dsps: boolean;
    electrical: boolean;
    plumbing: boolean;
    hvac: boolean;
  };
  overall: boolean;
} {
  return {
    minnesota: {
      dli: !!process.env.MINNESOTA_DLI_API_KEY,
      electrical: !!process.env.MINNESOTA_ELECTRICAL_API_KEY,
      plumbing: !!process.env.MINNESOTA_PLUMBING_API_KEY,
      hvac: !!process.env.MINNESOTA_HVAC_API_KEY,
    },
    wisconsin: {
      dsps: !!process.env.WISCONSIN_DSPS_API_KEY,
      electrical: !!process.env.WISCONSIN_ELECTRICAL_API_KEY,
      plumbing: !!process.env.WISCONSIN_PLUMBING_API_KEY,
      hvac: !!process.env.WISCONSIN_HVAC_API_KEY,
    },
    overall: !!(
      process.env.MINNESOTA_DLI_API_KEY ||
      process.env.MINNESOTA_ELECTRICAL_API_KEY ||
      process.env.MINNESOTA_PLUMBING_API_KEY ||
      process.env.MINNESOTA_HVAC_API_KEY ||
      process.env.WISCONSIN_DSPS_API_KEY ||
      process.env.WISCONSIN_ELECTRICAL_API_KEY ||
      process.env.WISCONSIN_PLUMBING_API_KEY ||
      process.env.WISCONSIN_HVAC_API_KEY
    )
  };
}
