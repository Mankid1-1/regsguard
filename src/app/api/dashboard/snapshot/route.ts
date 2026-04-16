import { NextResponse } from "next/server";
import { getDbUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * Lightweight dashboard snapshot for first-login quick-win flow
 */
export async function GET() {
  const user = await getDbUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date();
    const thirtyDaysOut = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const deadlines = await prisma.userDeadline.findMany({
      where: { userId: user.id },
    });

    const overdue = deadlines.filter(
      (d) =>
        d.nextDueDate < now &&
        d.status !== "COMPLETED" &&
        d.status !== "SKIPPED"
    ).length;

    const dueSoon = deadlines.filter(
      (d) =>
        d.nextDueDate >= now &&
        d.nextDueDate <= thirtyDaysOut &&
        d.status !== "COMPLETED" &&
        d.status !== "SKIPPED"
    ).length;

    const onTrack = deadlines.filter(
      (d) =>
        d.nextDueDate > thirtyDaysOut &&
        d.status !== "COMPLETED" &&
        d.status !== "SKIPPED"
    ).length;

    return NextResponse.json({
      overdue,
      dueSoon,
      onTrack,
    });
  } catch (error) {
    console.error("Error fetching snapshot:", error);
    return NextResponse.json(
      { error: "Failed to fetch snapshot" },
      { status: 500 }
    );
  }
}
