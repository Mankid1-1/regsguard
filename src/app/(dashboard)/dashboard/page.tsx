import { redirect } from "next/navigation";
import { getDbUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getDaysUntil } from "@/lib/utils/dates";
import { StatsOverview } from "@/components/dashboard/stats-overview";
import { DeadlineList } from "@/components/dashboard/deadline-list";
import { CalendarView } from "@/components/dashboard/calendar-view";
import { FilingHistory } from "@/components/dashboard/filing-history";
import { FilingPipeline } from "@/components/dashboard/filing-pipeline";
import { SetupChecklist } from "@/components/dashboard/setup-checklist";
import { ComplianceScore } from "@/components/dashboard/compliance-score";
import { ExportButton } from "@/components/export/export-button";
import { AutoRenewalStatus } from "@/components/dashboard/auto-renewal-status";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { ComplianceInsights } from "@/components/dashboard/compliance-insights";
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

  // Parallel fetch: activity, deadlines, setup status
  const [recentActivity, deadlines, profile, regulationCount, documentCount] = await Promise.all([
    prisma.complianceLog.findMany({
      where: { userId },
      include: {
        regulation: { select: { title: true, authority: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.userDeadline.findMany({
      where: { userId },
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
            officialEmail: true,
            category: true,
          },
        },
      },
      orderBy: { nextDueDate: "asc" },
    }),
    prisma.businessProfile.findUnique({ where: { userId }, select: { id: true } }),
    prisma.userRegulation.count({ where: { userId } }),
    prisma.document.count({ where: { userId } }),
  ]);

  // Auto-renewal configs will be empty until migration is run
  const autoRenewalConfigs: any[] = [];

  // Compute live status for each deadline based on current date
  const deadlinesWithStatus = deadlines.map((d: any) => {
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
  const listDeadlines = deadlinesWithStatus.filter((d: any) => {
    if (d.status === "COMPLETED" || d.status === "SKIPPED") return false;
    const dueDate = new Date(d.nextDueDate);
    return dueDate <= ninetyDaysOut || d.status === "OVERDUE";
  });

  // Stats
  const upcoming = deadlinesWithStatus.filter((d: any) => d.status === "UPCOMING").length;
  const dueSoon = deadlinesWithStatus.filter((d: any) => d.status === "DUE_SOON").length;
  const overdue = deadlinesWithStatus.filter((d: any) => d.status === "OVERDUE").length;
  const completed = deadlinesWithStatus.filter((d: any) => d.status === "COMPLETED").length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Compliance Dashboard</h1>
        <div className="flex items-center gap-3">
          <QuickActions />
          <ExportButton />
        </div>
      </div>

      <div className="space-y-6">
        {/* Setup checklist for new users */}
        <SetupChecklist
          hasProfile={!!profile}
          regulationCount={regulationCount}
          deadlineCount={deadlines.length}
          documentCount={documentCount}
        />

        {/* Top row: compliance score, stats, and auto-renewal status */}
        <div className="grid gap-4 lg:grid-cols-4">
          <ComplianceScore />
          <div className="lg:col-span-2">
            <StatsOverview
              upcoming={upcoming}
              dueSoon={dueSoon}
              overdue={overdue}
              completed={completed}
            />
          </div>
          <AutoRenewalStatus 
            configs={autoRenewalConfigs.map((config: any) => ({
              id: config.id,
              regulation: config.regulation,
              enabled: config.enabled,
              nextRenewalAt: config.nextRenewalAt?.toISOString() || '',
              autoPay: config.autoPay,
            }))}
          />
        </div>

        {/* Compliance insights */}
        <ComplianceInsights 
          deadlines={deadlinesWithStatus}
          autoRenewalCount={autoRenewalConfigs.filter(c => c.enabled).length}
          totalRegulations={regulationCount}
        />

        {/* Main content: upcoming deadlines with auto-renewal indicators */}
        <DeadlineList 
          deadlines={listDeadlines.map((d: any) => ({
            ...d,
            hasAutoRenewal: autoRenewalConfigs.some((c: any) => 
              c.regulationId === d.regulation.id && c.enabled
            ),
          }))}
        />

        {/* Pipeline + calendar + history with enhanced data */}
        <div className="grid gap-6 lg:grid-cols-2">
          <FilingPipeline
            deadlines={deadlinesWithStatus
              .filter((d: any) => d.status !== "COMPLETED" && d.status !== "SKIPPED")
              .map((d: any) => ({
                ...d,
                regulation: {
                  ...d.regulation,
                  officialEmail: (d.regulation as Record<string, unknown>).officialEmail as string | null,
                },
                hasAutoRenewal: autoRenewalConfigs.some((c: any) => 
                  c.regulationId === d.regulation.id && c.enabled
                ),
              }))}
          />
          <FilingHistory
            activity={recentActivity.map((a: any) => ({
              id: a.id,
              action: a.action,
              createdAt: a.createdAt.toISOString(),
              regulation: a.regulation ? { title: a.regulation.title, authority: a.regulation.authority } : null,
              details: a.details as Record<string, unknown> | null,
            }))}
          />
        </div>

        {/* Calendar view with auto-renewal indicators */}
        <CalendarView 
          deadlines={deadlinesWithStatus.map((d: any) => ({
            ...d,
            hasAutoRenewal: autoRenewalConfigs.some((c: any) => 
              c.regulationId === d.regulation.id && c.enabled
            ),
          }))}
        />
      </div>
    </div>
  );
}
