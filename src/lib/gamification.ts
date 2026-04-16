import { prisma } from "@/lib/prisma";

/**
 * Compliance Streak: Track days without overdue items
 */
export async function updateComplianceStreak(userId: string): Promise<number> {
  const userDeadlines = await prisma.userDeadline.findMany({
    where: { userId },
  });

  const now = new Date();
  const hasOverdue = userDeadlines.some(
    (d) => d.nextDueDate < now && d.status !== "COMPLETED" && d.status !== "SKIPPED"
  );

  let streak = await prisma.complianceStreak.findUnique({
    where: { userId },
  });

  if (!streak) {
    streak = await prisma.complianceStreak.create({
      data: { userId, days: hasOverdue ? 0 : 1 },
    });
  } else {
    if (hasOverdue) {
      // Reset streak if overdue found
      await prisma.complianceStreak.update({
        where: { userId },
        data: { days: 0, lastCheck: now },
      });
      return 0;
    } else {
      // Increment streak
      const daysSinceLastCheck = Math.floor(
        (now.getTime() - streak.lastCheck.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysSinceLastCheck > 0) {
        await prisma.complianceStreak.update({
          where: { userId },
          data: {
            days: { increment: daysSinceLastCheck },
            lastCheck: now,
          },
        });
      }
    }
  }

  return streak.days;
}

/**
 * Badges: Award badges based on user actions
 */
const BADGE_CRITERIA = {
  LEAD_MASTER: "All licenses current",
  SPEED_FILER: "Generated 5+ documents",
  TAX_READY: "All tax documents complete",
  EARLY_ADOPTER: "First 100 users at $19/mo",
  COMPLIANCE_CHAMPION: "100+ days overdue-free",
};

export async function checkAndAwardBadges(userId: string): Promise<string[]> {
  const awarded: string[] = [];

  // Check LEAD_MASTER: All deadlines current
  const overdueCount = await prisma.userDeadline.count({
    where: {
      userId,
      status: "OVERDUE",
    },
  });

  if (overdueCount === 0) {
    if (await awardBadge(userId, "LEAD_MASTER")) {
      awarded.push("LEAD_MASTER");
    }
  }

  // Check SPEED_FILER: Generated 5+ documents
  const docCount = await prisma.document.count({
    where: { userId, status: { in: ["GENERATED", "SENT", "SIGNED", "FILED"] } },
  });

  if (docCount >= 5) {
    if (await awardBadge(userId, "SPEED_FILER")) {
      awarded.push("SPEED_FILER");
    }
  }

  // Check TAX_READY: Tax documents complete
  const taxDocs = await prisma.document.count({
    where: {
      userId,
      category: "TAX",
      status: { in: ["GENERATED", "SENT", "SIGNED", "FILED"] },
    },
  });

  if (taxDocs >= 2) {
    if (await awardBadge(userId, "TAX_READY")) {
      awarded.push("TAX_READY");
    }
  }

  // Check COMPLIANCE_CHAMPION: 100+ days streak
  const streak = await prisma.complianceStreak.findUnique({
    where: { userId },
  });

  if (streak && streak.days >= 100) {
    if (await awardBadge(userId, "COMPLIANCE_CHAMPION")) {
      awarded.push("COMPLIANCE_CHAMPION");
    }
  }

  return awarded;
}

async function awardBadge(userId: string, badge: string): Promise<boolean> {
  try {
    await prisma.userBadge.create({
      data: { userId, badge },
    });
    return true;
  } catch {
    // Badge already awarded
    return false;
  }
}

export async function getUserBadges(userId: string): Promise<string[]> {
  const badges = await prisma.userBadge.findMany({
    where: { userId },
    select: { badge: true },
  });

  return badges.map((b) => b.badge);
}

/**
 * Activity Feed: Log public actions for live feed
 */
export async function logActivityFeedEvent(
  userId: string,
  action: string,
  title: string,
  options: {
    description?: string;
    trade?: string;
    state?: string;
    public?: boolean;
  } = {}
): Promise<void> {
  await prisma.activityFeed.create({
    data: {
      userId,
      action,
      title,
      description: options.description,
      trade: options.trade,
      state: options.state,
      public: options.public !== false,
    },
  });
}

export async function getPublicActivityFeed(limit = 10) {
  const activities = await prisma.activityFeed.findMany({
    where: { public: true },
    include: {
      user: {
        select: { name: true, image: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return activities.map((a) => ({
    title: a.title,
    description: a.description,
    trade: a.trade,
    state: a.state,
    userName: a.user.name,
    userImage: a.user.image,
    createdAt: a.createdAt,
  }));
}

/**
 * Compliance Certificate: Shareable proof of compliance
 */
export async function generateComplianceCertificate(
  userId: string,
  score: number
): Promise<string> {
  const cert = await prisma.complianceCertificate.create({
    data: {
      userId,
      token: `cert_${Date.now()}`,
      title: score === 100 ? "100% Compliant" : `${score}% Compliant`,
      score,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Expires in 7 days
    },
  });

  return cert.shareUrl || `/certificates/${cert.token}`;
}
