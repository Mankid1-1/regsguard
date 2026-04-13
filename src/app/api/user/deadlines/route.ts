import { NextRequest, NextResponse } from "next/server";
import { getDbUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getDaysUntil } from "@/lib/utils/dates";
import type { DeadlineStatus } from "@prisma/client";

export async function GET(req: NextRequest) {
  const user = await getDbUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = user.id;
  const { searchParams } = new URL(req.url);

  // Optional query params
  const statusFilter = searchParams.get("status") as DeadlineStatus | null;
  const daysParam = searchParams.get("days");
  const days = daysParam ? parseInt(daysParam, 10) : 90;

  // Build the date range
  const now = new Date();
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + days);

  // Fetch user deadlines
  const deadlines = await prisma.userDeadline.findMany({
    where: {
      userId,
      ...(statusFilter && { status: statusFilter }),
    },
    include: {
      regulation: {
        select: {
          id: true,
          title: true,
          authority: true,
          trade: true,
          state: true,
          fee: true,
          portalUrl: true,
          category: true,
          renewalCycle: true,
          description: true,
          officialEmail: true,
          notes: true,
        },
      },
    },
    orderBy: {
      nextDueDate: "asc",
    },
  });

  // Compute live status and filter by date range
  const results = deadlines
    .map((d) => {
      let status: DeadlineStatus = d.status;
      if (status !== "COMPLETED" && status !== "SKIPPED") {
        const daysLeft = getDaysUntil(d.nextDueDate);
        if (daysLeft < 0) {
          status = "OVERDUE";
        } else if (daysLeft <= 30) {
          status = "DUE_SOON";
        } else {
          status = "UPCOMING";
        }
      }

      return {
        id: d.id,
        nextDueDate: d.nextDueDate.toISOString(),
        status,
        completedAt: d.completedAt?.toISOString() ?? null,
        createdAt: d.createdAt.toISOString(),
        updatedAt: d.updatedAt.toISOString(),
        regulation: d.regulation,
      };
    })
    .filter((d) => {
      // If filtering by status via query param, re-check after live status computation
      if (statusFilter && d.status !== statusFilter) return false;

      // If not completed/skipped, filter by date range
      if (d.status !== "COMPLETED" && d.status !== "SKIPPED") {
        const dueDate = new Date(d.nextDueDate);
        // Always include overdue, otherwise check range
        if (d.status === "OVERDUE") return true;
        return dueDate <= endDate;
      }

      return true;
    });

  return NextResponse.json({
    deadlines: results,
    total: results.length,
    params: {
      days,
      status: statusFilter,
    },
  });
}
