import { NextResponse } from "next/server";
import { getDbUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { cache } from "@/lib/cache";

function getGrade(score: number): "A" | "B" | "C" | "D" | "F" {
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 70) return "C";
  if (score >= 60) return "D";
  return "F";
}

// Category importance weights
const CATEGORY_WEIGHTS: Record<string, number> = {
  LICENSE_RENEWAL: 1.5,
  EPA_CERTIFICATION: 1.5,
  SAFETY_TRAINING: 1.3,
  INSURANCE: 1.2,
  BONDING: 1.2,
  CONTINUING_EDUCATION: 1.0,
  PERMIT: 1.0,
  REGISTRATION: 1.0,
};

/**
 * Calculate overdue penalty scaled by days overdue.
 */
function overduePenalty(daysOverdue: number): number {
  if (daysOverdue <= 7) return -1;
  if (daysOverdue <= 30) return -2;
  return -3;
}

/**
 * Calculate proximity credit based on days until due.
 */
function proximityCredit(daysLeft: number): number {
  if (daysLeft > 60) return 1;
  if (daysLeft > 30) return 0.9;
  if (daysLeft > 14) return 0.75;
  if (daysLeft > 7) return 0.5;
  return 0.25;
}

export async function GET() {
  const authUser = await getDbUser();
  if (!authUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = authUser.id;

  // Cache the score for 2 minutes to reduce DB load
  const result = await cache.get(`compliance-score:${userId}`, 120, async () => {
    const now = new Date();

    // --- 1. Deadlines score (max 35 points) ---
    const deadlines = await prisma.userDeadline.findMany({
      where: { userId },
      include: { regulation: { select: { category: true } } },
    });

    let deadlineScore = 0;
    if (deadlines.length > 0) {
      let weightedPoints = 0;
      let totalWeight = 0;

      for (const d of deadlines) {
        const weight = CATEGORY_WEIGHTS[d.regulation.category] ?? 1.0;
        totalWeight += weight;

        if (d.status === "COMPLETED") {
          weightedPoints += 1 * weight;
        } else if (d.status === "SKIPPED") {
          // No points
        } else {
          const daysLeft = Math.floor(
            (d.nextDueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
          );
          if (daysLeft < 0) {
            weightedPoints += overduePenalty(Math.abs(daysLeft)) * weight;
          } else if (daysLeft <= 30) {
            weightedPoints += proximityCredit(daysLeft) * weight;
          } else {
            weightedPoints += 1 * weight;
          }
        }
      }

      const ratio = Math.max(0, weightedPoints / totalWeight);
      deadlineScore = Math.round(ratio * 35);
    } else {
      deadlineScore = 20;
    }

    // --- 2. CE Credits score (max 25 points) ---
    const ceCredits = await prisma.cECredit.findMany({
      where: { userId },
    });

    let ceScore = 0;
    if (ceCredits.length > 0) {
      const totalHours = ceCredits.reduce((sum, c) => sum + c.hours, 0);
      const yearStart = new Date(now.getFullYear(), 0, 1);
      const thisYearHours = ceCredits
        .filter((c) => c.completedAt >= yearStart)
        .reduce((sum, c) => sum + c.hours, 0);

      const hasCredits = totalHours > 0 ? 10 : 0;
      const recentActivity = Math.min(thisYearHours / 20, 1) * 15;
      ceScore = Math.round(hasCredits + recentActivity);
    } else {
      ceScore = 5;
    }

    // --- 3. Insurance/Bond score (max 20 points) ---
    const profile = await prisma.businessProfile.findUnique({
      where: { userId },
    });

    let insuranceScore = 0;
    if (profile) {
      if (profile.insuranceExpiration) {
        if (profile.insuranceExpiration > now) {
          insuranceScore += 10;
        } else {
          insuranceScore += 2;
        }
      } else if (profile.insuranceProvider) {
        insuranceScore += 5;
      }

      if (profile.bondExpiration) {
        if (profile.bondExpiration > now) {
          insuranceScore += 10;
        } else {
          insuranceScore += 2;
        }
      } else if (profile.bondProvider) {
        insuranceScore += 5;
      }
    }

    // --- 4. Document filings score (max 20 points) ---
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const recentFilings = await prisma.complianceLog.count({
      where: { userId, createdAt: { gte: thirtyDaysAgo } },
    });

    const quarterFilings = await prisma.complianceLog.count({
      where: { userId, createdAt: { gte: ninetyDaysAgo } },
    });

    const recentPoints = Math.min(recentFilings / 3, 1) * 12;
    const quarterPoints = Math.min(quarterFilings / 8, 1) * 8;
    const filingScore = Math.round(recentPoints + quarterPoints);

    // --- Total ---
    const score = Math.min(
      100,
      Math.max(0, deadlineScore + ceScore + insuranceScore + filingScore)
    );

    return {
      score,
      breakdown: {
        deadlines: { score: deadlineScore, max: 35, count: deadlines.length },
        ceCredits: {
          score: ceScore,
          max: 25,
          totalHours: ceCredits.reduce((sum, c) => sum + c.hours, 0),
          count: ceCredits.length,
        },
        insurance: { score: insuranceScore, max: 20 },
        filings: {
          score: filingScore,
          max: 20,
          recent: recentFilings,
          quarter: quarterFilings,
        },
      },
      grade: getGrade(score),
      version: 2,
    };
  });

  return NextResponse.json(result);
}
