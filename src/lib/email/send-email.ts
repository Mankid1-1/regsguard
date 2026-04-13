import { resend } from "@/lib/resend";
import nodemailer from "nodemailer";

interface EmailAttachment {
  filename: string;
  content: Buffer;
}

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
  attachments?: EmailAttachment[];
  /** Override the from address (for white-label tenants) */
  fromAddress?: string;
}

interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

const MAX_RETRIES = 3;
const BACKOFF_BASE_MS = 1000;

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function sendWithResend(params: SendEmailParams): Promise<SendEmailResult> {
  if (!resend) {
    throw new Error("Resend client not configured");
  }

  const fromAddress =
    params.fromAddress ||
    process.env.EMAIL_FROM ||
    "RegsGuard <noreply@regsguard.com>";

  const { data, error } = await resend.emails.send({
    from: fromAddress,
    to: params.to,
    subject: params.subject,
    html: params.html,
    replyTo: params.replyTo,
    attachments: params.attachments?.map((a) => ({
      filename: a.filename,
      content: a.content,
    })),
  });

  if (error) {
    throw new Error(error.message);
  }

  return {
    success: true,
    messageId: data?.id,
  };
}

async function sendWithNodemailer(params: SendEmailParams): Promise<SendEmailResult> {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || "587", 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    throw new Error("SMTP configuration is incomplete");
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  const fromAddress =
    params.fromAddress ||
    process.env.EMAIL_FROM ||
    "RegsGuard <noreply@regsguard.com>";

  const info = await transporter.sendMail({
    from: fromAddress,
    to: params.to,
    subject: params.subject,
    html: params.html,
    replyTo: params.replyTo,
    attachments: params.attachments?.map((a) => ({
      filename: a.filename,
      content: a.content,
      contentType: "application/pdf",
    })),
  });

  return {
    success: true,
    messageId: info.messageId,
  };
}

export async function sendEmail(params: SendEmailParams): Promise<SendEmailResult> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      // Try Resend first, fall back to Nodemailer
      if (resend) {
        return await sendWithResend(params);
      }
      return await sendWithNodemailer(params);
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      console.error(
        `[EMAIL] Attempt ${attempt}/${MAX_RETRIES} failed:`,
        lastError.message
      );

      // On Resend failure, try Nodemailer as fallback before retrying
      if (resend && attempt === 1) {
        try {
          console.log("[EMAIL] Resend failed, trying Nodemailer fallback...");
          return await sendWithNodemailer(params);
        } catch (fallbackErr) {
          console.error(
            "[EMAIL] Nodemailer fallback also failed:",
            fallbackErr instanceof Error ? fallbackErr.message : fallbackErr
          );
        }
      }

      if (attempt < MAX_RETRIES) {
        const delay = BACKOFF_BASE_MS * Math.pow(2, attempt - 1);
        console.log(`[EMAIL] Retrying in ${delay}ms...`);
        await sleep(delay);
      }
    }
  }

  return {
    success: false,
    error: lastError?.message || "Failed to send email after all retries",
  };
}
