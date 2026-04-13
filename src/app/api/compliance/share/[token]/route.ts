import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  if (!token) {
    return NextResponse.json({ error: "Token required" }, { status: 400 });
  }

  const share = await prisma.complianceShare.findUnique({
    where: { token },
  });

  if (!share) {
    return NextResponse.json(
      { error: "Compliance portal not found" },
      { status: 404 }
    );
  }

  if (!share.active) {
    return NextResponse.json(
      { error: "This compliance portal has been deactivated" },
      { status: 410 }
    );
  }

  if (share.expiresAt && share.expiresAt < new Date()) {
    return NextResponse.json(
      { error: "This compliance portal link has expired" },
      { status: 410 }
    );
  }

  // Increment view count and update last viewed timestamp
  await prisma.complianceShare.update({
    where: { id: share.id },
    data: {
      viewCount: { increment: 1 },
      lastViewedAt: new Date(),
    },
  });

  // Fetch compliance data for this user -- no sensitive fields exposed
  const userId = share.userId;
  const now = new Date();

  const [profile, userRegulations, deadlines, recentLogs] = await Promise.all([
    prisma.businessProfile.findUnique({
      where: { userId },
      select: {
        businessName: true,
        city: true,
        state: true,
        phone: true,
        insuranceProvider: true,
        insuranceExpiration: true,
        bondProvider: true,
        bondExpiration: true,
      },
    }),
    prisma.userRegulation.findMany({
      where: { userId },
      include: {
        regulation: {
          select: {
            title: true,
            trade: true,
            state: true,
            category: true,
            renewalCycle: true,
            authority: true,
          },
        },
      },
    }),
    prisma.userDeadline.findMany({
      where: { userId },
      include: {
        regulation: {
          select: { title: true, category: true },
        },
      },
      orderBy: { nextDueDate: "asc" },
    }),
    prisma.complianceLog.findMany({
      where: { userId },
      select: {
        action: true,
        createdAt: true,
        details: true,
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);

  // Calculate compliance score inline (same logic as compliance-score route)
  let deadlineScore = 0;
  if (deadlines.length > 0) {
    let points = 0;
    for (const d of deadlines) {
      if (d.status === "COMPLETED") {
        points += 1;
      } else if (d.status === "SKIPPED") {
        points += 0;
      } else {
        const daysLeft = Math.floor(
          (d.nextDueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );
        if (daysLeft < 0) points -= 1;
        else if (daysLeft <= 30) points += 0.5;
        else points += 1;
      }
    }
    const ratio = Math.max(0, points / deadlines.length);
    deadlineScore = Math.round(ratio * 35);
  } else {
    deadlineScore = 20;
  }

  let insuranceScore = 0;
  if (profile) {
    if (profile.insuranceExpiration) {
      insuranceScore += profile.insuranceExpiration > now ? 10 : 2;
    } else if (profile.insuranceProvider) {
      insuranceScore += 5;
    }
    if (profile.bondExpiration) {
      insuranceScore += profile.bondExpiration > now ? 10 : 2;
    } else if (profile.bondProvider) {
      insuranceScore += 5;
    }
  }

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentFilings = recentLogs.filter(
    (l) => l.createdAt >= thirtyDaysAgo
  ).length;
  const filingScore = Math.round(Math.min(recentFilings / 3, 1) * 20);

  const score = Math.min(
    100,
    Math.max(0, deadlineScore + insuranceScore + filingScore + 15)
  );

  function getGrade(s: number): string {
    if (s >= 90) return "A";
    if (s >= 80) return "B";
    if (s >= 70) return "C";
    if (s >= 60) return "D";
    return "F";
  }

  // Build safe display data (no emails, no internal IDs)
  const regulations = userRegulations.map((ur) => ({
    name: ur.regulation.title,
    trade: ur.regulation.trade,
    state: ur.regulation.state,
    category: ur.regulation.category,
    renewalCycle: ur.regulation.renewalCycle,
    authority: ur.regulation.authority,
  }));

  const deadlineStatuses = deadlines.map((d) => ({
    regulation: d.regulation.title,
    category: d.regulation.category,
    status: d.status,
    nextDueDate: d.nextDueDate,
    completedAt: d.completedAt,
  }));

  const filings = recentLogs.map((l) => ({
    action: l.action,
    date: l.createdAt,
  }));

  return NextResponse.json({
    business: {
      name: profile?.businessName || "Business",
      city: profile?.city || null,
      state: profile?.state || null,
      insuranceActive: profile?.insuranceExpiration
        ? profile.insuranceExpiration > now
        : false,
      bondActive: profile?.bondExpiration
        ? profile.bondExpiration > now
        : false,
    },
    complianceScore: { score, grade: getGrade(score) },
    regulations,
    deadlines: deadlineStatuses,
    recentFilings: filings,
    portalLabel: share.label,
  });
}
