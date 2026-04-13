import { redirect } from "next/navigation";
import { getDbUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getDaysUntil } from "@/lib/utils/dates";
import { StatsOverview } from "@/components/dashboard/stats-overview";
import { DeadlineList } from "@/components/dashboard/deadline-list";
import { CalendarView } from "@/components/dashboard/calendar-view";
import { FilingHistory } from "@/components/dashboard/filing-history";
import { ComplianceScore } from "@/components/dashboard/compliance-score";
import { ExportButton } from "@/components/export/export-button";
import type { DeadlineStatus } from "@prisma/client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const user = await getDbUser();
  if (!user) {
    redirect("/sign-in");
  }

  const userId = user.id;

  // Fetch deadlines with associated regulation data
  const now = new Date();
  const ninetyDaysOut = new Date();
  ninetyDaysOut.setDate(ninetyDaysOut.getDate() + 90);

  // Fetch recent compliance activity
  const recentActivity = await prisma.complianceLog.findMany({
    where: { userId },
    include: {
      regulation: { select: { title: true, authority: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  const deadlines = await prisma.userDeadline.findMany({
    where: {
      userId,
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
        },
      },
    },
    orderBy: {
      nextDueDate: "asc",
    },
  });

  // Compute live status for each deadline based on current date
  const deadlinesWithStatus = deadlines.map((d) => {
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
      regulation: d.regulation,
    };
  });

  // Filter to next 90 days for the list (include overdue always)
  const listDeadlines = deadlinesWithStatus.filter((d) => {
    if (d.status === "COMPLETED" || d.status === "SKIPPED") return false;
    const dueDate = new Date(d.nextDueDate);
    return dueDate <= ninetyDaysOut || d.status === "OVERDUE";
  });

  // Stats
  const upcoming = deadlinesWithStatus.filter((d) => d.status === "UPCOMING").length;
  const dueSoon = deadlinesWithStatus.filter((d) => d.status === "DUE_SOON").length;
  const overdue = deadlinesWithStatus.filter((d) => d.status === "OVERDUE").length;
  const completed = deadlinesWithStatus.filter((d) => d.status === "COMPLETED").length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <ExportButton />
      </div>

      <div className="space-y-6">
        {/* Top row: compliance score + stats at a glance */}
        <div className="grid gap-4 md:grid-cols-4">
          <ComplianceScore />
          <div className="md:col-span-3">
            <StatsOverview
              upcoming={upcoming}
              dueSoon={dueSoon}
              overdue={overdue}
              completed={completed}
            />
          </div>
        </div>

        {/* Main content: upcoming deadlines (what matters most) */}
        <DeadlineList deadlines={listDeadlines} />

        {/* Secondary: calendar + recent activity side by side */}
        <div className="grid gap-6 lg:grid-cols-2">
          <CalendarView deadlines={deadlinesWithStatus} />
          <FilingHistory
            activity={recentActivity.map((a) => ({
              id: a.id,
              action: a.action,
              createdAt: a.createdAt.toISOString(),
              regulation: a.regulation ? { title: a.regulation.title, authority: a.regulation.authority } : null,
              details: a.details as Record<string, unknown> | null,
            }))}
          />
        </div>
      </div>
    </div>
  );
}
