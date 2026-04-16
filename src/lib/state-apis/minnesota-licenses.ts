/**
 * Minnesota License Verification API Integration
 * Real-time license status checking for Minnesota trade professionals
 */

export interface MinnesotaLicenseResult {
  licenseNumber: string;
  status: 'ACTIVE' | 'EXPIRED' | 'SUSPENDED' | 'REVOKED' | 'PENDING';
  issueDate?: Date;
  expirationDate?: Date;
  licenseType: string;
  fullName: string;
  businessName?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  phone?: string;
  email?: string;
  discipline?: string[];
  restrictions?: string[];
  verifiedAt: Date;
  source: 'MN_DLI' | 'MN_ELECTRICAL' | 'MN_PLAGUING' | 'MN_HVAC';
}

/**
 * Verify Minnesota Contractor License via DLI API
 */
export async function verifyMinnesotaContractorLicense(
  licenseNumber: string,
  licenseType: 'RESIDENTIAL' | 'COMMERCIAL' | 'REMODEL' = 'RESIDENTIAL'
): Promise<MinnesotaLicenseResult> {
  const apiKey = process.env.MINNESOTA_DLI_API_KEY;
  
  if (!apiKey) {
    throw new Error("Minnesota DLI API key not configured");
  }

  try {
    // Minnesota DLI API endpoint (simulated - replace with real endpoint)
    const response = await fetch('https://dli.mn.gov/api/license-verification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'User-Agent': 'RegsGuard/1.0'
      },
      body: JSON.stringify({
        licenseNumber,
        licenseType,
        requestType: 'CONTRACTOR_VERIFICATION'
      })
    });

    if (!response.ok) {
      throw new Error(`Minnesota DLI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    return {
      licenseNumber: data.licenseNumber,
      status: data.status.toUpperCase(),
      issueDate: data.issueDate ? new Date(data.issueDate) : undefined,
      expirationDate: data.expirationDate ? new Date(data.expirationDate) : undefined,
      licenseType: data.licenseType,
      fullName: `${data.firstName} ${data.lastName}`,
      businessName: data.businessName,
      address: data.address,
      city: data.city,
      state: data.state || 'MN',
      zip: data.zip,
      phone: data.phone,
      email: data.email,
      discipline: data.discipline || [],
      restrictions: data.restrictions || [],
      verifiedAt: new Date(),
      source: 'MN_DLI'
    };
  } catch (error) {
    console.error('Minnesota license verification failed:', error);
    throw new Error(`Failed to verify Minnesota license: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Verify Minnesota Electrical License
 */
export async function verifyMinnesotaElectricalLicense(
  licenseNumber: string,
  licenseClass: 'JOURNEYMAN' | 'MASTER' | 'POWER_LIMITED' = 'JOURNEYMAN'
): Promise<MinnesotaLicenseResult> {
  const apiKey = process.env.MINNESOTA_ELECTRICAL_API_KEY;
  
  if (!apiKey) {
    throw new Error("Minnesota Electrical API key not configured");
  }

  try {
    // Minnesota Electrical Board API (simulated)
    const response = await fetch('https://www.electricboard.state.mn.us/api/verification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        licenseNumber,
        licenseClass,
        state: 'MN'
      })
    });

    if (!response.ok) {
      throw new Error(`Minnesota Electrical API error: ${response.status}`);
    }

    const data = await response.json();
    
    return {
      licenseNumber: data.licenseNumber,
      status: data.licenseStatus,
      issueDate: data.issueDate ? new Date(data.issueDate) : undefined,
      expirationDate: data.expirationDate ? new Date(data.expirationDate) : undefined,
      licenseType: `Electrical - ${licenseClass}`,
      fullName: data.fullName,
      businessName: data.employer,
      address: data.address,
      city: data.city,
      state: 'MN',
      zip: data.zip,
      phone: data.phone,
      verifiedAt: new Date(),
      source: 'MN_ELECTRICAL'
    };
  } catch (error) {
    console.error('Minnesota electrical license verification failed:', error);
    throw new Error(`Failed to verify Minnesota electrical license: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Verify Minnesota Plumbing License
 */
export async function verifyMinnesotaPlumbingLicense(
  licenseNumber: string,
  licenseType: 'JOURNEYMAN' | 'MASTER' | 'MEDICAL_GAS' = 'JOURNEYMAN'
): Promise<MinnesotaLicenseResult> {
  const apiKey = process.env.MINNESOTA_PLUMBING_API_KEY;
  
  if (!apiKey) {
    throw new Error("Minnesota Plumbing API key not configured");
  }

  try {
    // Minnesota Plumbing Board API (simulated)
    const response = await fetch('https://www.plumbingboard.state.mn.us/api/verification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        licenseNumber,
        licenseType,
        state: 'MN'
      })
    });

    if (!response.ok) {
      throw new Error(`Minnesota Plumbing API error: ${response.status}`);
    }

    const data = await response.json();
    
    return {
      licenseNumber: data.licenseNumber,
      status: data.licenseStatus,
      issueDate: data.issueDate ? new Date(data.issueDate) : undefined,
      expirationDate: data.expirationDate ? new Date(data.expirationDate) : undefined,
      licenseType: `Plumbing - ${licenseType}`,
      fullName: data.fullName,
      businessName: data.employer,
      address: data.address,
      city: data.city,
      state: 'MN',
      zip: data.zip,
      verifiedAt: new Date(),
      source: 'MN_PLAGUING'
    };
  } catch (error) {
    console.error('Minnesota plumbing license verification failed:', error);
    throw new Error(`Failed to verify Minnesota plumbing license: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Verify Minnesota HVAC License
 */
export async function verifyMinnesotaHVACLicense(
  licenseNumber: string,
  licenseType: 'CONTRACTOR' | 'TECHNICIAN' = 'CONTRACTOR'
): Promise<MinnesotaLicenseResult> {
  const apiKey = process.env.MINNESOTA_HVAC_API_KEY;
  
  if (!apiKey) {
    throw new Error("Minnesota HVAC API key not configured");
  }

  try {
    // Minnesota HVAC/Refrigeration API (simulated)
    const response = await fetch('https://www.dli.mn.gov/api/hvac-verification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        licenseNumber,
        licenseType,
        state: 'MN'
      })
    });

    if (!response.ok) {
      throw new Error(`Minnesota HVAC API error: ${response.status}`);
    }

    const data = await response.json();
    
    return {
      licenseNumber: data.licenseNumber,
      status: data.licenseStatus,
      issueDate: data.issueDate ? new Date(data.issueDate) : undefined,
      expirationDate: data.expirationDate ? new Date(data.expirationDate) : undefined,
      licenseType: `HVAC - ${licenseType}`,
      fullName: data.fullName,
      businessName: data.employer,
      address: data.address,
      city: data.city,
      state: 'MN',
      zip: data.zip,
      verifiedAt: new Date(),
      source: 'MN_HVAC'
    };
  } catch (error) {
    console.error('Minnesota HVAC license verification failed:', error);
    throw new Error(`Failed to verify Minnesota HVAC license: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Unified Minnesota license verification
 */
export async function verifyMinnesotaLicense(
  licenseNumber: string,
  trade: 'CONTRACTOR' | 'ELECTRICAL' | 'PLUMBING' | 'HVAC',
  licenseType?: string
): Promise<MinnesotaLicenseResult> {
  switch (trade) {
    case 'CONTRACTOR':
      return await verifyMinnesotaContractorLicense(licenseNumber, licenseType as any);
    case 'ELECTRICAL':
      return await verifyMinnesotaElectricalLicense(licenseNumber, licenseType as any);
    case 'PLUMBING':
      return await verifyMinnesotaPlumbingLicense(licenseNumber, licenseType as any);
    case 'HVAC':
      return await verifyMinnesotaHVACLicense(licenseNumber, licenseType as any);
    default:
      throw new Error(`Unsupported Minnesota trade: ${trade}`);
  }
}
