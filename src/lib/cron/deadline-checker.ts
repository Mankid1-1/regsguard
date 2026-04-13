import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email/send-email";
import { generateDeadlineAlertHtml } from "@/lib/email/templates/deadline-alert";
import { generateCompliancePdf } from "@/lib/pdf/generate-pdf";
import { calculateNextDueDate } from "./deadline-calculator";
import { maskPii } from "@/lib/pii-mask";
import { ALERT_THRESHOLDS } from "@/lib/utils/constants";

interface CheckResult {
  checked: number;
  notified: number;
  autoFiled: number;
  errors: number;
}

function computeThreshold(daysUntilDue: number): number | null {
  for (const threshold of ALERT_THRESHOLDS) {
    if (daysUntilDue <= threshold) {
      return threshold;
    }
  }
  return null;
}

export async function checkDeadlines(): Promise<CheckResult> {
  const result: CheckResult = { checked: 0, notified: 0, autoFiled: 0, errors: 0 };

  const now = new Date();
  const sixtyDaysFromNow = new Date(now);
  sixtyDaysFromNow.setDate(sixtyDaysFromNow.getDate() + 60);

  const deadlines = await prisma.userDeadline.findMany({
    where: {
      nextDueDate: { lte: sixtyDaysFromNow },
      status: { notIn: ["COMPLETED", "SKIPPED"] },
    },
    include: {
      user: {
        include: {
          businessProfile: true,
        },
      },
      regulation: true,
    },
  });

  result.checked = deadlines.length;

  for (const deadline of deadlines) {
    try {
      const diffMs = deadline.nextDueDate.getTime() - now.getTime();
      const daysUntilDue = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

      // Mark overdue if past due date
      if (daysUntilDue < 0 && deadline.status !== "OVERDUE") {
        await prisma.userDeadline.update({
          where: { id: deadline.id },
          data: { status: "OVERDUE" },
        });
      }

      // Mark DUE_SOON if within 14 days
      if (
        daysUntilDue >= 0 &&
        daysUntilDue <= 14 &&
        deadline.status === "UPCOMING"
      ) {
        await prisma.userDeadline.update({
          where: { id: deadline.id },
          data: { status: "DUE_SOON" },
        });
      }

      // Determine notification threshold
      const threshold = computeThreshold(daysUntilDue);

      if (threshold === null) continue;

      // Skip if already notified at this threshold
      if (deadline.lastNotifiedThreshold === threshold) continue;

      // Send notification email
      const userName =
        deadline.user.name ||
        deadline.user.businessProfile?.responsiblePerson ||
        "there";

      const dueDate = deadline.nextDueDate.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      const dashboardUrl =
        process.env.NEXTAUTH_URL || "https://app.regsguard.com";

      const html = generateDeadlineAlertHtml({
        userName,
        regulationTitle: deadline.regulation.title,
        daysUntilDue: Math.max(0, daysUntilDue),
        dueDate,
        authority: deadline.regulation.authority,
        category: deadline.regulation.category,
        fee: deadline.regulation.fee,
        portalUrl: deadline.regulation.portalUrl,
        dashboardUrl: `${dashboardUrl}/regulations/${deadline.regulationId}`,
      });

      const emailResult = await sendEmail({
        to: deadline.user.email,
        subject: `[RegsGuard] ${daysUntilDue <= 0 ? "OVERDUE" : daysUntilDue <= 7 ? "URGENT" : "Upcoming"}: ${deadline.regulation.title} - ${daysUntilDue <= 0 ? "Past Due" : `Due in ${daysUntilDue} days`}`,
        html,
      });

      if (emailResult.success) {
        await prisma.userDeadline.update({
          where: { id: deadline.id },
          data: {
            lastNotifiedAt: now,
            lastNotifiedThreshold: threshold,
          },
        });
        result.notified++;
      } else {
        console.error(
          `[CRON] Failed to email ${deadline.user.email}:`,
          emailResult.error
        );
        result.errors++;
      }

      // AUTO-FILE: At 7-day threshold, auto-generate PDF and send to authority
      if (threshold === 7 && deadline.regulation.officialEmail) {
        try {
          const alreadyFiled = await prisma.complianceLog.findFirst({
            where: {
              userId: deadline.userId,
              regulationId: deadline.regulationId,
              action: "EMAIL_SENT",
              createdAt: { gte: new Date(deadline.nextDueDate.getFullYear(), 0, 1) },
            },
          });

          if (!alreadyFiled) {
            const { buffer, filename } = await generateCompliancePdf(
              deadline.regulationId,
              deadline.userId
            );

            const businessName = deadline.user.businessProfile?.businessName || deadline.user.name || "Business";

            const filingResult = await sendEmail({
              to: deadline.regulation.officialEmail,
              subject: `Compliance Submission - ${deadline.regulation.title} - ${businessName}`,
              html: `<p>Please find attached the compliance report for <strong>${deadline.regulation.title}</strong> from <strong>${businessName}</strong>.</p><p>Contact: <a href="mailto:${deadline.user.email}">${deadline.user.email}</a></p>`,
              replyTo: deadline.user.email,
              attachments: [{ filename, content: buffer }],
            });

            if (filingResult.success) {
              await prisma.complianceLog.create({
                data: {
                  userId: deadline.userId,
                  regulationId: deadline.regulationId,
                  action: "EMAIL_SENT",
                  details: maskPii({
                    sentTo: deadline.regulation.officialEmail,
                    filename,
                    autoFiled: true,
                    messageId: filingResult.messageId,
                  }) as Record<string, string | boolean>,
                },
              });
              await prisma.complianceLog.create({
                data: {
                  userId: deadline.userId,
                  regulationId: deadline.regulationId,
                  action: "PDF_GENERATED",
                  details: { filename, autoGenerated: true },
                },
              });

              // Mark deadline completed and auto-renew
              await prisma.userDeadline.update({
                where: { id: deadline.id },
                data: { status: "COMPLETED", completedAt: now },
              });

              if (deadline.regulation.renewalCycle !== "ONE_TIME") {
                const nextDueDate = calculateNextDueDate(deadline.regulation, now);
                await prisma.userDeadline.create({
                  data: {
                    userId: deadline.userId,
                    regulationId: deadline.regulationId,
                    nextDueDate,
                    status: "UPCOMING",
                  },
                });
              }

              // Notify user that filing was auto-completed
              await sendEmail({
                to: deadline.user.email,
                subject: `[RegsGuard] Auto-Filed: ${deadline.regulation.title}`,
                html: `<p>Hi ${userName},</p><p>Great news! We automatically generated and sent your <strong>${deadline.regulation.title}</strong> compliance document to <strong>${deadline.regulation.authority}</strong> (${deadline.regulation.officialEmail}).</p><p>No action needed on your part. Your next deadline has been auto-scheduled.</p><p><a href="${dashboardUrl}/dashboard">View Dashboard</a></p>`,
              });

              result.autoFiled++;
              console.log(`[CRON] Auto-filed ${deadline.regulation.title} for ${deadline.user.email}`);
            }
          }
        } catch (err) {
          console.error(`[CRON] Auto-file failed for deadline ${deadline.id}:`, err instanceof Error ? err.message : err);
        }
      }
    } catch (err) {
      console.error(
        `[CRON] Error processing deadline ${deadline.id}:`,
        err instanceof Error ? err.message : err
      );
      result.errors++;
    }
  }

  return result;
}
