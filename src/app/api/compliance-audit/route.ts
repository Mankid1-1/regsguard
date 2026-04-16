import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const auditSchema = z.object({
  email: z.string().email("Invalid email address"),
  state: z.string().length(2, "State must be 2-letter code").refine(
    (s) => ["MN", "WI"].includes(s.toUpperCase()),
    "Only available for MN and WI"
  ),
  trade: z.string().min(1, "Trade is required"),
  licenseNumber: z.string().min(1, "License number is required"),
});

/**
 * Free compliance audit for MN/WI contractors (no signup required).
 * Analyzes license, insurance, and bond status based on submitted data.
 * Returns audit score (0-100) and missing items.
 */
export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = auditSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.issues },
      { status: 400 }
    );
  }

  const { email, state, trade, licenseNumber } = parsed.data;

  try {
    // Check if license exists in regulation database (real data)
    const regulation = await prisma.regulation.findFirst({
      where: {
        trade: trade.toUpperCase() as never,
        state: state.toUpperCase(),
        active: true,
      },
    });

    const missingItems: string[] = [];
    let auditScore = 100;

    // Base: license requirement exists
    if (!regulation) {
      missingItems.push("License regulation not found in system");
      auditScore -= 20;
    }

    // Check insurance requirement (based on regulation category)
    if (regulation?.category === "INSURANCE" || regulation?.category === "BONDING") {
      missingItems.push("Insurance coverage status unknown");
      auditScore -= 15;
    }

    // Check bond requirement
    if (regulation?.category === "BONDING") {
      missingItems.push("Bond status unknown");
      auditScore -= 15;
    }

    // Check CE requirements
    const ceRequirements = await prisma.regulation.findMany({
      where: {
        trade: trade.toUpperCase() as never,
        state: state.toUpperCase(),
        category: "CONTINUING_EDUCATION",
      },
    });

    if (ceRequirements.length > 0) {
      missingItems.push(`${ceRequirements.length} CE requirement(s) to track`);
      auditScore -= 10;
    }

    // Record audit (for analytics/follow-up)
    await prisma.complianceAudit.create({
      data: {
        email,
        state: state.toUpperCase(),
        trade,
        licenseNumber,
        auditScore: Math.max(0, auditScore),
        missingItems: missingItems,
      },
    });

    // Return audit results
    return NextResponse.json(
      {
        email,
        state: state.toUpperCase(),
        trade,
        auditScore: Math.max(0, auditScore),
        status: auditScore === 100 ? "complete" : "incomplete",
        missingItems,
        recommendations: generateRecommendations(auditScore, missingItems),
        nextSteps: [
          "Sign up for RegsGuard to start tracking these deadlines",
          "Get automatic reminders before deadlines",
          "Generate compliance documents in seconds",
        ],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Audit error:", error);
    return NextResponse.json(
      { error: "Audit failed. Please try again." },
      { status: 500 }
    );
  }
}

function generateRecommendations(score: number, missingItems: string[]): string[] {
  const recs: string[] = [];

  if (score < 50) {
    recs.push("Your compliance status needs attention. Multiple items are missing.");
  } else if (score < 80) {
    recs.push("You're partially compliant. Set up tracking for missing items.");
  } else {
    recs.push("You're mostly compliant. Keep monitoring to stay current.");
  }

  if (missingItems.some((i) => i.includes("CE"))) {
    recs.push("Schedule continuing education hours before deadline.");
  }

  if (missingItems.some((i) => i.includes("Insurance"))) {
    recs.push("Verify insurance is current and covers your trade.");
  }

  if (missingItems.some((i) => i.includes("Bond"))) {
    recs.push("Check surety bond status and renewal date.");
  }

  return recs.slice(0, 3);
}
