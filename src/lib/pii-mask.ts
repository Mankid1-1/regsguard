/**
 * PII masking utility for compliance logs and audit records.
 *
 * Masks emails, phone numbers, and known sensitive field names
 * before storing in ComplianceLog.details or AuditLog.details.
 */

const SENSITIVE_KEYS = new Set([
  "email",
  "sentTo",
  "recipientEmail",
  "recipientPhone",
  "phone",
  "smsPhone",
  "clientEmail",
  "clientPhone",
  "contactEmail",
  "signerEmail",
  "taxId",
  "ssn",
  "socialSecurityNumber",
  "insurancePolicyNumber",
  "bondNumber",
]);

/**
 * Mask an email address: "john.doe@example.com" → "j***@example.com"
 */
function maskEmail(email: string): string {
  const at = email.indexOf("@");
  if (at <= 0) return "***";
  return email[0] + "***" + email.slice(at);
}

/**
 * Mask a phone number: "+15551234567" → "***-***-4567"
 */
function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 4) return "***";
  return "***-***-" + digits.slice(-4);
}

/**
 * Mask a generic sensitive string: keep first and last char only.
 */
function maskGeneric(value: string): string {
  if (value.length <= 2) return "***";
  return value[0] + "*".repeat(Math.min(value.length - 2, 8)) + value[value.length - 1];
}

/**
 * Determine masking strategy for a value based on its key name.
 */
function maskValue(key: string, value: string): string {
  const lower = key.toLowerCase();
  if (lower.includes("email") || value.includes("@")) return maskEmail(value);
  if (lower.includes("phone") || lower.includes("sms")) return maskPhone(value);
  return maskGeneric(value);
}

/**
 * Deep-mask PII in a details object before persisting.
 *
 * Only masks string values whose keys are in the sensitive set.
 * Non-string values and non-sensitive keys pass through unchanged.
 */
export function maskPii(
  details: Record<string, unknown>
): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(details)) {
    if (typeof value === "string" && SENSITIVE_KEYS.has(key)) {
      result[key] = maskValue(key, value);
    } else if (value !== null && typeof value === "object" && !Array.isArray(value)) {
      result[key] = maskPii(value as Record<string, unknown>);
    } else {
      result[key] = value;
    }
  }

  return result;
}
