import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getDbUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RegulationActions } from "@/components/regulations/regulation-actions";

function getStatusBadge(status: string) {
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
    BIENNIAL: "Biennial (Every 2 Years)",
    TRIENNIAL: "Triennial (Every 3 Years)",
    FIVE_YEAR: "Every 5 Years",
    ONE_TIME: "One-Time",
    VARIES: "Varies",
  };
  return map[cycle] || cycle;
}

function formatAction(action: string): string {
  const map: Record<string, string> = {
    PDF_GENERATED: "PDF Generated",
    EMAIL_SENT: "Email Sent",
    DEADLINE_COMPLETED: "Deadline Completed",
    DEADLINE_CREATED: "Deadline Created",
    PROFILE_UPDATED: "Profile Updated",
    REGULATION_ADDED: "Regulation Added",
  };
  return map[action] || action;
}

function getActionColor(action: string): "success" | "default" | "warning" | "danger" | "outline" {
  switch (action) {
    case "EMAIL_SENT":
    case "DEADLINE_COMPLETED":
      return "success";
    case "PDF_GENERATED":
      return "default";
    case "DEADLINE_CREATED":
    case "REGULATION_ADDED":
      return "outline";
    default:
      return "default";
  }
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function RegulationDetailPage({ params }: PageProps) {
  const { id } = await params;
  const user = await getDbUser();
  if (!user) redirect("/sign-in");

  const userRegulation = await prisma.userRegulation.findUnique({
    where: {
      userId_regulationId: {
        userId: user.id,
        regulationId: id,
      },
    },
    include: {
      regulation: true,
    },
  });

  if (!userRegulation) notFound();

  const regulation = userRegulation.regulation;

  // Fetch all deadlines for this regulation
  const deadlines = await prisma.userDeadline.findMany({
    where: {
      userId: user.id,
      regulationId: id,
    },
    orderBy: { nextDueDate: "desc" },
  });

  const activeDeadline = deadlines.find(
    (d) => d.status !== "COMPLETED" && d.status !== "SKIPPED"
  );

  // Fetch compliance history
  const complianceLogs = await prisma.complianceLog.findMany({
    where: {
      userId: user.id,
      regulationId: id,
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  const daysUntilDue = activeDeadline
    ? Math.ceil(
        (activeDeadline.nextDueDate.getTime() - Date.now()) /
          (1000 * 60 * 60 * 24)
      )
    : null;

  return (
    <div className="space-y-6">
      {/* Back navigation */}
      <Link
        href="/regulations"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Back to Regulations
      </Link>

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">
              {regulation.title}
            </h1>
            {activeDeadline && getStatusBadge(activeDeadline.status)}
          </div>
          <p className="text-muted-foreground">
            {regulation.authority} &middot; {regulation.state}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Regulation Details */}
          <Card>
            <CardHeader>
              <CardTitle>Regulation Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground leading-relaxed">
                {regulation.description}
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Category
                  </p>
                  <p className="text-sm font-medium mt-1">
                    {formatCategory(regulation.category)}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Renewal Cycle
                  </p>
                  <p className="text-sm font-medium mt-1">
                    {formatCycle(regulation.renewalCycle)}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Trade
                  </p>
                  <p className="text-sm font-medium mt-1">
                    {regulation.trade.charAt(0) +
                      regulation.trade.slice(1).toLowerCase().replace("_", " ")}
                  </p>
                </div>
                {regulation.fee && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Fee
                    </p>
                    <p className="text-sm font-medium mt-1">
                      {regulation.fee}
                    </p>
                  </div>
                )}
              </div>

              {regulation.portalUrl && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                    Official Portal
                  </p>
                  <a
                    href={regulation.portalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline inline-flex items-center gap-1"
                  >
                    {regulation.portalUrl}
                    <svg
                      className="h-3.5 w-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                  </a>
                </div>
              )}

              {regulation.officialEmail && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                    Official Email
                  </p>
                  <a
                    href={`mailto:${regulation.officialEmail}`}
                    className="text-sm text-primary hover:underline"
                  >
                    {regulation.officialEmail}
                  </a>
                </div>
              )}

              {regulation.notes && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                    Notes
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {regulation.notes}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Compliance History */}
          <Card>
            <CardHeader>
              <CardTitle>Compliance History</CardTitle>
            </CardHeader>
            <CardContent>
              {complianceLogs.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No compliance activity yet. Generate a PDF or send a
                  compliance email to get started.
                </p>
              ) : (
                <div className="space-y-4">
                  {complianceLogs.map((log) => {
                    const details = log.details as Record<string, string> | null;
                    return (
                      <div
                        key={log.id}
                        className="flex items-start gap-3 border-b border-border pb-3 last:border-0 last:pb-0"
                      >
                        <div className="mt-0.5">
                          <Badge variant={getActionColor(log.action)} className="text-xs">
                            {formatAction(log.action)}
                          </Badge>
                        </div>
                        <div className="flex-1 min-w-0">
                          {details?.filename && (
                            <p className="text-sm text-foreground truncate">
                              {details.filename}
                            </p>
                          )}
                          {details?.sentTo && (
                            <p className="text-sm text-muted-foreground">
                              Sent to {details.sentTo}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {log.createdAt.toLocaleString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Deadline Card */}
          <Card>
            <CardHeader>
              <CardTitle>Deadline</CardTitle>
            </CardHeader>
            <CardContent>
              {activeDeadline ? (
                <div className="space-y-3">
                  <div
                    className={`rounded-lg p-4 text-center ${
                      daysUntilDue !== null && daysUntilDue <= 0
                        ? "bg-danger/10 border border-danger/20"
                        : daysUntilDue !== null && daysUntilDue <= 7
                          ? "bg-warning/10 border border-warning/20"
                          : daysUntilDue !== null && daysUntilDue <= 30
                            ? "bg-warning/5 border border-warning/10"
                            : "bg-primary/5 border border-primary/10"
                    }`}
                  >
                    <p className="text-3xl font-bold">
                      {daysUntilDue !== null && daysUntilDue <= 0
                        ? "Overdue"
                        : daysUntilDue}
                    </p>
                    {daysUntilDue !== null && daysUntilDue > 0 && (
                      <p className="text-sm text-muted-foreground">
                        days remaining
                      </p>
                    )}
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium">
                      {activeDeadline.nextDueDate.toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  {activeDeadline.lastNotifiedAt && (
                    <p className="text-xs text-muted-foreground text-center">
                      Last notified:{" "}
                      {activeDeadline.lastNotifiedAt.toLocaleDateString(
                        "en-US",
                        {
                          month: "short",
                          day: "numeric",
                        }
                      )}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No active deadline
                </p>
              )}
            </CardContent>
          </Card>

          {/* Actions Card */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <RegulationActions
                regulationId={regulation.id}
                regulationTitle={regulation.title}
                officialEmail={regulation.officialEmail}
              />
            </CardContent>
          </Card>

          {/* Previous Deadlines */}
          {deadlines.filter(
            (d) => d.status === "COMPLETED" || d.status === "SKIPPED"
          ).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Previous Deadlines</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {deadlines
                    .filter(
                      (d) =>
                        d.status === "COMPLETED" || d.status === "SKIPPED"
                    )
                    .map((d) => (
                      <div
                        key={d.id}
                        className="flex items-center justify-between py-1.5 border-b border-border last:border-0"
                      >
                        <span className="text-sm text-muted-foreground">
                          {d.nextDueDate.toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                        {getStatusBadge(d.status)}
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
