import { prisma } from "@/lib/prisma";

/**
 * Calculate contractor compliance score (0-100) based on real deadlines
 * Used for dashboard display and certificates
 */
export async function calculateComplianceScore(userId: string): Promise<number> {
  const deadlines = await prisma.userDeadline.findMany({
    where: { userId },
  });

  if (deadlines.length === 0) {
    // No deadlines tracked yet = incomplete setup
    return 0;
  }

  const now = new Date();

  // Score breakdown
  let score = 100;

  // Deduct for overdue items (20 points per overdue)
  const overdue = deadlines.filter(
    (d) =>
      d.nextDueDate < now && d.status !== "COMPLETED" && d.status !== "SKIPPED"
  ).length;
  score -= Math.min(overdue * 20, 40); // Cap at -40

  // Deduct for due soon items (10 points per)
  const thirtyDaysOut = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const dueSoon = deadlines.filter(
    (d) =>
      d.nextDueDate >= now &&
      d.nextDueDate <= thirtyDaysOut &&
      d.status !== "COMPLETED" &&
      d.status !== "SKIPPED"
  ).length;
  score -= Math.min(dueSoon * 10, 30); // Cap at -30

  // Bonus for completed deadlines (1 point per 5 completed)
  const completed = deadlines.filter((d) => d.status === "COMPLETED").length;
  score += Math.min(Math.floor(completed / 5), 10); // Cap at +10

  return Math.max(0, Math.min(100, score));
}

export async function getComplianceGrade(score: number): string {
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 70) return "C";
  if (score >= 60) return "D";
  return "F";
}

export async function getComplianceStatus(userId: string): Promise<{
  score: number;
  grade: string;
  status: "excellent" | "good" | "fair" | "poor" | "critical";
  message: string;
}> {
  const score = await calculateComplianceScore(userId);
  const grade = await getComplianceGrade(score);

  let status: "excellent" | "good" | "fair" | "poor" | "critical" = "critical";
  let message = "";

  if (score >= 90) {
    status = "excellent";
    message = "You're crushing compliance. Keep it up!";
  } else if (score >= 80) {
    status = "good";
    message = "On track. A few items need attention.";
  } else if (score >= 70) {
    status = "fair";
    message = "Some compliance gaps. Address these soon.";
  } else if (score >= 60) {
    status = "poor";
    message = "Multiple overdue items. Action needed.";
  } else {
    status = "critical";
    message = "Critical compliance gaps. Urgent action needed.";
  }

  return { score, grade, status, message };
}
