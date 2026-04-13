import { prisma } from "@/lib/prisma";
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
 * - Checks the user's NotificationPreference for email / SMS / push and
 *   dispatches accordingly (stubs for now -- just logs).
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

  // Fetch the user's preferences (or use defaults)
  let prefs = await prisma.notificationPreference.findUnique({
    where: { userId },
  });

  if (!prefs) {
    // Create default preferences if none exist
    prefs = await prisma.notificationPreference.create({
      data: {
        userId,
        emailEnabled: true,
        smsEnabled: false,
        pushEnabled: true,
        inAppEnabled: true,
        alertDays: [60, 30, 14, 7, 1],
      },
    });
  }

  // Email channel
  if (prefs.emailEnabled) {
    // Stub: In production this would call the email service
    console.log(`[NOTIFICATION:EMAIL] To user ${userId}: "${title}" - ${body}`);
  }

  // SMS channel
  if (prefs.smsEnabled && prefs.smsPhone) {
    // Stub: In production this would call Twilio / SMS provider
    console.log(
      `[NOTIFICATION:SMS] To ${prefs.smsPhone} (user ${userId}): "${title}" - ${body}`
    );
  }

  // Push channel
  if (prefs.pushEnabled) {
    // Stub: In production this would send a web push notification
    console.log(`[NOTIFICATION:PUSH] To user ${userId}: "${title}" - ${body}`);
  }

  return notification;
}
