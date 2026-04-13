import { redirect } from "next/navigation";
import Link from "next/link";
import { getDbUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RegulationActions } from "@/components/regulations/regulation-actions";

function getStatusBadge(status: string | null) {
  switch (status) {
    case "OVERDUE":
      return <Badge variant="danger">Overdue</Badge>;
    case "DUE_SOON":
      return <Badge variant="warning">Due Soon</Badge>;
    case "COMPLETED":
      return <Badge variant="success">Completed</Badge>;
    case "SKIPPED":
      return <Badge variant="outline">Skipped</Badge>;
    case "UPCOMING":
    default:
      return <Badge variant="default">Upcoming</Badge>;
  }
}

function formatCategory(cat: string): string {
  return cat
    .split("_")
    .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
    .join(" ");
}

function formatCycle(cycle: string): string {
  const map: Record<string, string> = {
    ANNUAL: "Annual",
    BIENNIAL: "Biennial",
    TRIENNIAL: "Triennial",
    FIVE_YEAR: "5-Year",
    ONE_TIME: "One-Time",
    VARIES: "Varies",
  };
  return map[cycle] || cycle;
}

export default async function RegulationsPage() {
  const user = await getDbUser();
  if (!user) redirect("/sign-in");

  const userRegulations = await prisma.userRegulation.findMany({
    where: { userId: user.id },
    include: {
      regulation: true,
    },
    orderBy: { createdAt: "desc" },
  });

  // Fetch deadlines for these regulations
  const regulationIds = userRegulations.map((ur) => ur.regulationId);
  const deadlines = await prisma.userDeadline.findMany({
    where: {
      userId: user.id,
      regulationId: { in: regulationIds },
      status: { notIn: ["COMPLETED", "SKIPPED"] },
    },
    orderBy: { nextDueDate: "asc" },
  });

  // Map deadlines by regulationId (use first active one)
  const deadlineMap = new Map<
    string,
    { nextDueDate: Date; status: string }
  >();
  for (const d of deadlines) {
    if (!deadlineMap.has(d.regulationId)) {
      deadlineMap.set(d.regulationId, {
        nextDueDate: d.nextDueDate,
        status: d.status,
      });
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Regulations</h1>
          <p className="text-muted-foreground mt-1">
            Track and manage your compliance requirements
          </p>
        </div>
      </div>

      {userRegulations.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <svg
              className="h-12 w-12 text-muted-foreground/50 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
              />
            </svg>
            <h3 className="text-lg font-semibold mb-1">No regulations yet</h3>
            <p className="text-muted-foreground text-sm text-center max-w-sm">
              Regulations will appear here once they are added to your account
              during onboarding or by an administrator.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {userRegulations.map((ur) => {
            const reg = ur.regulation;
            const deadline = deadlineMap.get(reg.id);
            const daysUntilDue = deadline
              ? Math.ceil(
                  (deadline.nextDueDate.getTime() - Date.now()) /
                    (1000 * 60 * 60 * 24)
                )
              : null;

            return (
              <Card key={ur.id} className="flex flex-col">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <Link
                      href={`/regulations/${reg.id}`}
                      className="hover:text-primary transition-colors"
                    >
                      <CardTitle className="text-base leading-snug">
                        {reg.title}
                      </CardTitle>
                    </Link>
                    {deadline && getStatusBadge(deadline.status)}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground">
                      {formatCategory(reg.category)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      &middot;
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatCycle(reg.renewalCycle)}
                    </span>
                  </div>
                </CardHeader>

                <CardContent className="flex-1 flex flex-col justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <svg
                        className="h-4 w-4 shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                        />
                      </svg>
                      <span className="truncate">{reg.authority}</span>
                    </div>

                    {deadline && (
                      <div className="flex items-center gap-2 text-sm">
                        <svg
                          className="h-4 w-4 shrink-0 text-muted-foreground"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <span
                          className={
                            daysUntilDue !== null && daysUntilDue <= 7
                              ? "text-danger font-medium"
                              : daysUntilDue !== null && daysUntilDue <= 30
                                ? "text-warning font-medium"
                                : "text-muted-foreground"
                          }
                        >
                          {deadline.nextDueDate.toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                          {daysUntilDue !== null && (
                            <span className="ml-1">
                              ({daysUntilDue <= 0
                                ? "Overdue"
                                : `${daysUntilDue}d left`})
                            </span>
                          )}
                        </span>
                      </div>
                    )}

                    {reg.fee && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <svg
                          className="h-4 w-4 shrink-0"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <span>{reg.fee}</span>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-border pt-3">
                    <RegulationActions
                      regulationId={reg.id}
                      regulationTitle={reg.title}
                      officialEmail={reg.officialEmail}
                    />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
