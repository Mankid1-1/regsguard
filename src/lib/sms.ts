import { logger } from "@/lib/logger";

interface SendSmsParams {
  to: string;
  body: string;
}

interface SendSmsResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Send an SMS via Twilio.
 *
 * Requires env vars:
 *   TWILIO_ACCOUNT_SID
 *   TWILIO_AUTH_TOKEN
 *   TWILIO_PHONE_NUMBER
 *
 * Falls back to a stub log if Twilio is not configured.
 */
export async function sendSms(params: SendSmsParams): Promise<SendSmsResult> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_PHONE_NUMBER;

  // Clean phone number to E.164 format
  const cleanPhone = params.to.replace(/\D/g, "");
  const e164 = cleanPhone.length === 10 ? `+1${cleanPhone}` : `+${cleanPhone}`;

  if (!accountSid || !authToken || !fromNumber) {
    logger.warn("Twilio not configured — SMS will be logged only", {
      to: e164,
      bodyPreview: params.body.slice(0, 50),
    });

    // Dev stub: log instead of sending
    console.log("[SMS-DEV]", { to: e164, body: params.body });
    return { success: true, messageId: `stub_${Date.now()}` };
  }

  try {
    // Use Twilio REST API directly (no SDK dependency needed)
    const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        To: e164,
        From: fromNumber,
        Body: params.body,
      }).toString(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      const errorMsg = errorData.message || `Twilio error ${response.status}`;
      logger.error("SMS send failed", { to: e164, error: errorMsg });
      return { success: false, error: errorMsg };
    }

    const data = await response.json();
    logger.info("SMS sent successfully", { to: e164, sid: data.sid });
    return { success: true, messageId: data.sid };
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    logger.error("SMS send exception", { to: e164 }, error);
    return { success: false, error: error.message };
  }
}
