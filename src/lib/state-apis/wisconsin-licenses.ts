/**
 * Wisconsin License Verification API Integration
 * Real-time license status checking for Wisconsin trade professionals
 */

export interface WisconsinLicenseResult {
  licenseNumber: string;
  status: 'ACTIVE' | 'EXPIRED' | 'SUSPENDED' | 'REVOKED' | 'PENDING' | 'INACTIVE';
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
  source: 'WI_DSPS' | 'WI_ELECTRICAL' | 'WI_PLAGUING' | 'WI_HVAC';
}

/**
 * Verify Wisconsin Contractor License via DSPS API
 */
export async function verifyWisconsinContractorLicense(
  licenseNumber: string,
  licenseType: 'DWELLING' | 'COMMERCIAL' | 'HOME_IMPROVEMENT' = 'DWELLING'
): Promise<WisconsinLicenseResult> {
  const apiKey = process.env.WISCONSIN_DSPS_API_KEY;
  
  if (!apiKey) {
    throw new Error("Wisconsin DSPS API key not configured");
  }

  try {
    // Wisconsin DSPS License Lookup API (simulated - replace with real endpoint)
    const response = await fetch('https://dps.wi.gov/api/license-lookup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'User-Agent': 'RegsGuard/1.0'
      },
      body: JSON.stringify({
        licenseNumber,
        licenseType: `CONTRACTOR_${licenseType}`,
        state: 'WI',
        searchType: 'LICENSE_NUMBER'
      })
    });

    if (!response.ok) {
      throw new Error(`Wisconsin DSPS API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    return {
      licenseNumber: data.licenseNumber,
      status: data.licenseStatus,
      issueDate: data.originalIssueDate ? new Date(data.originalIssueDate) : undefined,
      expirationDate: data.expirationDate ? new Date(data.expirationDate) : undefined,
      licenseType: data.licenseDescription || `Contractor - ${licenseType}`,
      fullName: `${data.firstName} ${data.lastName}`,
      businessName: data.businessName,
      address: data.addressLine1,
      city: data.city,
      state: data.state || 'WI',
      zip: data.zipCode,
      phone: data.phoneNumber,
      email: data.emailAddress,
      discipline: data.disciplinaryActions || [],
      restrictions: data.restrictions || [],
      verifiedAt: new Date(),
      source: 'WI_DSPS'
    };
  } catch (error) {
    console.error('Wisconsin license verification failed:', error);
    throw new Error(`Failed to verify Wisconsin license: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Verify Wisconsin Electrical License
 */
export async function verifyWisconsinElectricalLicense(
  licenseNumber: string,
  licenseClass: 'JOURNEYMAN' | 'MASTER' | 'COMMERCIAL' | 'RESIDENTIAL' = 'JOURNEYMAN'
): Promise<WisconsinLicenseResult> {
  const apiKey = process.env.WISCONSIN_ELECTRICAL_API_KEY;
  
  if (!apiKey) {
    throw new Error("Wisconsin Electrical API key not configured");
  }

  try {
    // Wisconsin Electrical Examining Board API (simulated)
    const response = await fetch('https://eelsb.wi.gov/api/license-verification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        licenseNumber,
        licenseClass,
        state: 'WI'
      })
    });

    if (!response.ok) {
      throw new Error(`Wisconsin Electrical API error: ${response.status}`);
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
      state: 'WI',
      zip: data.zip,
      phone: data.phone,
      verifiedAt: new Date(),
      source: 'WI_ELECTRICAL'
    };
  } catch (error) {
    console.error('Wisconsin electrical license verification failed:', error);
    throw new Error(`Failed to verify Wisconsin electrical license: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Verify Wisconsin Plumbing License
 */
export async function verifyWisconsinPlumbingLicense(
  licenseNumber: string,
  licenseType: 'JOURNEYMAN' | 'MASTER' | 'APPRENTICE' = 'JOURNEYMAN'
): Promise<WisconsinLicenseResult> {
  const apiKey = process.env.WISCONSIN_PLUMBING_API_KEY;
  
  if (!apiKey) {
    throw new Error("Wisconsin Plumbing API key not configured");
  }

  try {
    // Wisconsin Plumbing Board API (simulated)
    const response = await fetch('https://dps.wi.gov/api/plumbing-verification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        licenseNumber,
        licenseType,
        state: 'WI'
      })
    });

    if (!response.ok) {
      throw new Error(`Wisconsin Plumbing API error: ${response.status}`);
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
      state: 'WI',
      zip: data.zip,
      verifiedAt: new Date(),
      source: 'WI_PLAGUING'
    };
  } catch (error) {
    console.error('Wisconsin plumbing license verification failed:', error);
    throw new Error(`Failed to verify Wisconsin plumbing license: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Verify Wisconsin HVAC License
 */
export async function verifyWisconsinHVACLicense(
  licenseNumber: string,
  licenseType: 'CONTRACTOR' | 'TECHNICIAN' | 'APPRENTICE' = 'CONTRACTOR'
): Promise<WisconsinLicenseResult> {
  const apiKey = process.env.WISCONSIN_HVAC_API_KEY;
  
  if (!apiKey) {
    throw new Error("Wisconsin HVAC API key not configured");
  }

  try {
    // Wisconsin HVAC/Refrigeration API (simulated)
    const response = await fetch('https://dps.wi.gov/api/hvac-verification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        licenseNumber,
        licenseType,
        state: 'WI'
      })
    });

    if (!response.ok) {
      throw new Error(`Wisconsin HVAC API error: ${response.status}`);
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
      state: 'WI',
      zip: data.zip,
      verifiedAt: new Date(),
      source: 'WI_HVAC'
    };
  } catch (error) {
    console.error('Wisconsin HVAC license verification failed:', error);
    throw new Error(`Failed to verify Wisconsin HVAC license: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Unified Wisconsin license verification
 */
export async function verifyWisconsinLicense(
  licenseNumber: string,
  trade: 'CONTRACTOR' | 'ELECTRICAL' | 'PLUMBING' | 'HVAC',
  licenseType?: string
): Promise<WisconsinLicenseResult> {
  switch (trade) {
    case 'CONTRACTOR':
      return await verifyWisconsinContractorLicense(licenseNumber, licenseType as any);
    case 'ELECTRICAL':
      return await verifyWisconsinElectricalLicense(licenseNumber, licenseType as any);
    case 'PLUMBING':
      return await verifyWisconsinPlumbingLicense(licenseNumber, licenseType as any);
    case 'HVAC':
      return await verifyWisconsinHVACLicense(licenseNumber, licenseType as any);
    default:
      throw new Error(`Unsupported Wisconsin trade: ${trade}`);
  }
}
