import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email/send-email";
import type { NotificationType } from "@prisma/client";

/**
 * Creates a single in-app notification record.
 */
export async function createNotification(
  userId: string,
  type: NotificationType,
  title: string,
  body: string,
  data?: Record<string, unknown>
) {
  return prisma.notification.create({
    data: {
      userId,
      type,
      title,
      body,
      data: data ? (data as object) : undefined,
      channel: "IN_APP",
      read: false,
    },
  });
}

/**
 * Dispatches a notification across all channels the user has enabled.
 *
 * - Always creates an IN_APP notification.
 * - Sends email via Resend if user has email notifications enabled.
 * - Logs SMS/push for future integration.
 */
export async function dispatchNotification(
  userId: string,
  type: NotificationType,
  title: string,
  body: string,
  data?: Record<string, unknown>
) {
  // Always create the in-app notification
  const notification = await createNotification(userId, type, title, body, data);

  // Fetch user email + preferences
  const [user, existingPrefs] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { email: true } }),
    prisma.notificationPreference.findUnique({ where: { userId } }),
  ]);

  const prefs = existingPrefs ?? await prisma.notificationPreference.create({
    data: {
      userId,
      emailEnabled: true,
      smsEnabled: false,
      pushEnabled: true,
      inAppEnabled: true,
      alertDays: [60, 30, 14, 7, 1],
    },
  });

  // Email channel -- send via Resend
  if (prefs.emailEnabled && user?.email) {
    try {
      await sendEmail({
        to: user.email,
        subject: `RegsGuard: ${title}`,
        html: `
          <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px">
            <h2 style="color:#1a1a1a;margin:0 0 8px">${title}</h2>
            <p style="color:#555;font-size:15px;line-height:1.6;margin:0 0 20px">${body}</p>
            <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://regsguard.vercel.app"}/dashboard"
               style="display:inline-block;background:#2563eb;color:#fff;padding:10px 24px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:600">
              Open Dashboard
            </a>
            <p style="color:#999;font-size:12px;margin-top:24px">
              You&rsquo;re receiving this because you have email notifications enabled in RegsGuard.
            </p>
          </div>
        `,
      });
    } catch (err) {
      console.error(`[NOTIFICATION:EMAIL] Failed for user ${userId}:`, err);
    }
  }

  // SMS channel -- log for future Twilio integration
  if (prefs.smsEnabled && prefs.smsPhone) {
    console.log(`[NOTIFICATION:SMS] To ${prefs.smsPhone}: "${title}"`);
  }

  return notification;
}
