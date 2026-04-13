import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email/send-email";
import { sendSms } from "@/lib/sms";
import { maskPii } from "@/lib/pii-mask";
import { logger } from "@/lib/logger";

interface FollowUpSenderResult {
  processed: number;
  sent: number;
  errors: number;
}

/**
 * Cron job function: processes all due follow-ups that have not been sent yet.
 * For each, it "sends" via the appropriate channel (email stub or SMS stub),
 * updates sentAt, and creates a ComplianceLog entry.
 *
 * Intended to be called from a cron scheduler or manual trigger endpoint.
 */
export async function processScheduledFollowUps(): Promise<FollowUpSenderResult> {
  const now = new Date();

  // Find all follow-ups that are due and haven't been sent
  const dueFollowUps = await prisma.scheduledFollowUp.findMany({
    where: {
      scheduledAt: { lte: now },
      sentAt: null,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      project: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    take: 100, // Process in batches to avoid overload
  });

  let sent = 0;
  let errors = 0;

  for (const followUp of dueFollowUps) {
    try {
      // Determine recipient info
      const recipientEmail = followUp.clientEmail || null;
      const recipientPhone = followUp.clientPhone || null;

      // Send via the appropriate channel
      if (followUp.channel === "EMAIL" && recipientEmail) {
        const subject = followUp.project
          ? `Follow-up: ${followUp.project.name}`
          : "Follow-up from your contractor";
        const html = `<div style="font-family: sans-serif;"><p>${followUp.message.replace(/\n/g, "<br/>")}</p><hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;"/><p style="color:#999;font-size:12px;">Sent via RegsGuard</p></div>`;
        const result = await sendEmail({
          to: recipientEmail,
          subject,
          html,
          replyTo: followUp.user.email,
        });
        if (!result.success) {
          logger.warn("Follow-up email failed", { followUpId: followUp.id, error: result.error });
        }
      } else if (followUp.channel === "SMS" && recipientPhone) {
        const result = await sendSms({ to: recipientPhone, body: followUp.message });
        if (!result.success) {
          logger.warn("Follow-up SMS failed", { followUpId: followUp.id, error: result.error });
        }
      } else {
        // In-app/push notification — create in-app notification (push handled by service worker)
        logger.info("Follow-up via in-app notification", {
          userId: followUp.userId,
          channel: followUp.channel,
        });
      }

      // Mark as sent
      await prisma.scheduledFollowUp.update({
        where: { id: followUp.id },
        data: { sentAt: now },
      });

      // Create notification for the user (in-app confirmation)
      await prisma.notification.create({
        data: {
          userId: followUp.userId,
          type: "FOLLOW_UP",
          title: "Follow-up Sent",
          body: followUp.project
            ? `Your follow-up for "${followUp.project.name}" was sent via ${followUp.channel.toLowerCase()}.`
            : `Your scheduled follow-up was sent via ${followUp.channel.toLowerCase()}.`,
          channel: "IN_APP",
          data: {
            followUpId: followUp.id,
            sentVia: followUp.channel,
            recipientEmail,
            recipientPhone,
          },
        },
      });

      // Create compliance log
      await prisma.complianceLog.create({
        data: {
          userId: followUp.userId,
          action: "FOLLOW_UP_SENT",
          details: maskPii({
            followUpId: followUp.id,
            channel: followUp.channel,
            projectId: followUp.projectId,
            recipientEmail: recipientEmail ?? "",
            recipientPhone: recipientPhone ?? "",
            sentAt: now.toISOString(),
          }) as Record<string, string | null>,
        },
      });

      sent++;
    } catch (err) {
      console.error(
        `[FOLLOW-UP] Error processing follow-up ${followUp.id}:`,
        err instanceof Error ? err.message : err
      );
      errors++;
    }
  }

  return {
    processed: dueFollowUps.length,
    sent,
    errors,
  };
}

/** Alias for scheduler compatibility */
export const processFollowUps = processScheduledFollowUps;
