/**
 * Verification API response wrapper.
 * Adds explicit mode: "live" | "simulated" to all verification responses.
 */

export interface VerificationResponse {
  mode: "live" | "simulated";
  status: "verified" | "unverified" | "error";
  details?: Record<string, unknown>;
  message?: string;
  source?: string; // "license_api", "insurance_api", "bond_api", etc.
}

/**
 * Wrap a verification response with explicit mode disclosure.
 */
export function createVerificationResponse(
  mode: "live" | "simulated",
  status: "verified" | "unverified" | "error",
  options: {
    details?: Record<string, unknown>;
    message?: string;
    source?: string;
  } = {}
): VerificationResponse {
  return {
    mode,
    status,
    ...options,
  };
}

/**
 * Determine if a verification provider is configured.
 */
export async function isProviderConfigured(provider: string): Promise<boolean> {
  const env = process.env;

  switch (provider) {
    case "license":
      return Boolean(env.LICENSE_API_KEY);
    case "insurance":
      return Boolean(env.INSURANCE_API_KEY);
    case "bond":
      return Boolean(env.BOND_API_KEY);
    case "sms":
      return Boolean(env.TWILIO_ACCOUNT_SID && env.TWILIO_AUTH_TOKEN);
    case "email":
      return Boolean(env.RESEND_API_KEY || (env.SMTP_HOST && env.SMTP_USER));
    default:
      return false;
  }
}
