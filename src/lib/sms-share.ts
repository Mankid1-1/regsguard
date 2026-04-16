/**
 * SMS and WhatsApp share triggers
 * Send deadline alerts with one-click share links
 */

export interface SMSSharePayload {
  phoneNumber: string;
  message: string;
  shareLinks: {
    whatsapp: string;
    sms: string;
  };
}

/**
 * Format SMS message for compliance deadline with share triggers
 */
export function formatDeadlineSMS(
  contractorName: string,
  deadlineTitle: string,
  daysUntil: number,
  generateUrl: string
): string {
  return `Hey ${contractorName}! Your ${deadlineTitle} is due in ${daysUntil} days. Generate & file in 60 seconds → ${generateUrl}`;
}

export function formatDocumentGeneratedSMS(
  contractorName: string,
  documentTitle: string,
  shareUrl: string
): string {
  return `✅ ${contractorName}, your ${documentTitle} is ready to send. Share your compliance win → ${shareUrl}`;
}

/**
 * WhatsApp share message builder
 */
export function formatWhatsAppMessage(
  message: string,
  shareUrl?: string
): string {
  if (shareUrl) {
    return `${message}\n\n📤 Share: ${shareUrl}`;
  }
  return message;
}

/**
 * Generate share links for SMS/WhatsApp
 */
export function generateShareLinks(
  message: string,
  phoneNumber?: string
): SMSSharePayload["shareLinks"] {
  const encodedMessage = encodeURIComponent(message);

  return {
    whatsapp: `https://wa.me/?text=${encodedMessage}`,
    sms: `sms:${phoneNumber || ""}?body=${encodedMessage}`,
  };
}

/**
 * Twilio SMS notification (implementation reference)
 * Requires TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER
 */
export async function sendDeadlineAlertSMS(
  phoneNumber: string,
  message: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_PHONE_NUMBER;

  if (!accountSid || !authToken || !fromNumber) {
    return {
      success: false,
      error: "SMS not configured. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER.",
    };
  }

  try {
    // Twilio Node.js client would go here
    // For now, return placeholder
    return {
      success: true,
      messageId: `msg_${Date.now()}`,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "SMS send failed",
    };
  }
}

/**
 * Format for contractor (field worker) who might prefer SMS over email
 */
export const SMS_TEMPLATES = {
  DEADLINE_ALERT: {
    format: (deadlineTitle: string, daysUntil: number) =>
      `Reminder: ${deadlineTitle} due in ${daysUntil} days. Tap to generate → {generate_link}`,
    delay: 7, // days before deadline
  },

  DOCUMENT_READY: {
    format: (documentTitle: string) =>
      `✅ Your ${documentTitle} is ready. Share your compliance win → {share_link}`,
    delay: 0,
  },

  REFERRAL_EARNED: {
    format: () =>
      `🎉 Congrats! You earned $20 credit for referring a contractor. Refer 3 more for a free month → {referral_link}`,
    delay: 0,
  },

  STREAK_MILESTONE: {
    format: (streakDays: number) =>
      `🔥 You're ${streakDays} days overdue-free! Share your compliance streak → {share_link}`,
    delay: 0,
  },
};
