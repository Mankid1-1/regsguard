import { prisma } from "@/lib/prisma";
import { buildCanonicalUrl } from "@/lib/app-origin.server";

/**
 * Weekly digest email for contractors
 * Real data: deadlines met, documents generated, time saved, badges earned
 */

export interface WeeklyDigestData {
  userName: string;
  userEmail: string;
  deadlinesCompleted: number;
  documentsGenerated: number;
  timeSavedHours: number;
  currentStreak: number;
  badgesEarned: string[];
  nextDeadline: {
    title: string;
    daysUntil: number;
  } | null;
  referralStats: {
    conversions: number;
    nextMilestone: number;
  } | null;
}

export async function getWeeklyDigestData(userId: string): Promise<WeeklyDigestData | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, email: true },
  });

  if (!user) return null;

  // Last 7 days
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  // Deadlines completed this week
  const deadlinesCompleted = await prisma.userDeadline.count({
    where: {
      userId,
      status: "COMPLETED",
      completedAt: { gte: weekAgo },
    },
  });

  // Documents generated this week
  const documentsGenerated = await prisma.document.count({
    where: {
      userId,
      status: { in: ["GENERATED", "SENT", "FILED"] },
      updatedAt: { gte: weekAgo },
    },
  });

  // Current compliance streak
  const streak = await prisma.complianceStreak.findUnique({
    where: { userId },
  });

  // Badges earned (any type)
  const badges = await prisma.userBadge.findMany({
    where: {
      userId,
      earnedAt: { gte: weekAgo },
    },
    select: { badge: true },
  });

  // Next deadline
  const nextDeadline = await prisma.userDeadline.findFirst({
    where: {
      userId,
      status: { notIn: ["COMPLETED", "SKIPPED"] },
      nextDueDate: { gte: new Date() },
    },
    include: {
      regulation: { select: { title: true } },
    },
    orderBy: { nextDueDate: "asc" },
  });

  // Referral stats
  const referralLink = await prisma.referralLink.findFirst({
    where: { userId },
  });

  let referralStats = null;
  if (referralLink) {
    const conversions = await prisma.referral.count({
      where: { code: referralLink.code, status: "CONVERTED" },
    });

    referralStats = {
      conversions,
      nextMilestone: 3 - (conversions % 3),
    };
  }

  // Time saved estimate: 30 min per document + 15 min per deadline
  const timeSavedHours = (documentsGenerated * 0.5 + deadlinesCompleted * 0.25);

  return {
    userName: user.name || "Contractor",
    userEmail: user.email,
    deadlinesCompleted,
    documentsGenerated,
    timeSavedHours: Math.round(timeSavedHours * 10) / 10,
    currentStreak: streak?.days || 0,
    badgesEarned: badges.map((b) => b.badge),
    nextDeadline: nextDeadline
      ? {
          title: nextDeadline.regulation.title,
          daysUntil: Math.ceil(
            (nextDeadline.nextDueDate.getTime() - Date.now()) /
              (1000 * 60 * 60 * 24)
          ),
        }
      : null,
    referralStats,
  };
}

export function renderWeeklyDigestEmail(data: WeeklyDigestData): string {
  const dashboardUrl = buildCanonicalUrl("/dashboard");
  const referralUrl = buildCanonicalUrl("/dashboard/referrals");

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; background: #f9fafb; padding: 20px; }
    .card { background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 24px; margin-bottom: 20px; }
    .stat { text-align: center; padding: 16px; background: #f3f4f6; border-radius: 6px; margin-bottom: 12px; }
    .stat-number { font-size: 32px; font-weight: bold; color: #1e40af; }
    .stat-label { font-size: 14px; color: #6b7280; margin-top: 4px; }
    .badge { display: inline-block; background: #dbeafe; color: #1e40af; padding: 6px 12px; border-radius: 4px; font-size: 12px; margin-right: 8px; margin-bottom: 8px; }
    .button { display: inline-block; background: #1e40af; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; }
    .footer { text-align: center; font-size: 12px; color: #9ca3af; margin-top: 40px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Your Weekly Compliance Report 📊</h1>
    
    <div class="card">
      <p>Hey ${data.userName},</p>
      <p>Here's what you nailed this week:</p>
    </div>

    <div class="card">
      <div class="stat">
        <div class="stat-number">${data.deadlinesCompleted}</div>
        <div class="stat-label">Deadlines Completed</div>
      </div>
      <div class="stat">
        <div class="stat-number">${data.documentsGenerated}</div>
        <div class="stat-label">Documents Generated</div>
      </div>
      <div class="stat">
        <div class="stat-number">${data.timeSavedHours}h</div>
        <div class="stat-label">Time Saved</div>
      </div>
      <div class="stat">
        <div class="stat-number" style="color: #16a34a;">${data.currentStreak}</div>
        <div class="stat-label">Days Overdue-Free 🔥</div>
      </div>
    </div>

    ${data.badgesEarned.length > 0 ? `
    <div class="card">
      <h3>New Badges 🏆</h3>
      ${data.badgesEarned.map(b => `<span class="badge">${b}</span>`).join('')}
    </div>
    ` : ''}

    ${data.nextDeadline ? `
    <div class="card">
      <h3>Next Up</h3>
      <p><strong>${data.nextDeadline.title}</strong> in ${data.nextDeadline.daysUntil} days</p>
      <a href="${dashboardUrl}" class="button">Generate Now</a>
    </div>
    ` : ''}

    ${data.referralStats ? `
    <div class="card" style="background: #f0fdf4; border-color: #86efac;">
      <h3>Referral Progress</h3>
      <p>${data.referralStats.conversions} of 3 conversions. ${data.referralStats.nextMilestone} more to earn a free month!</p>
      <a href="${referralUrl}" class="button" style="background: #16a34a;">Share Your Code</a>
    </div>
    ` : ''}

    <div class="card">
      <p>Keep crushing it. You're setting the standard for compliance.</p>
      <a href="${dashboardUrl}" class="button">View Dashboard</a>
    </div>

    <div class="footer">
      <p>RegsGuard • Compliance Autopilot for Contractors</p>
      <p><a href="https://regsguard.rebooked.org/preferences" style="color: #9ca3af;">Manage Preferences</a></p>
    </div>
  </div>
</body>
</html>
  `.trim();
}
