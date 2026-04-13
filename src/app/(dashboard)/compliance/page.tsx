import { redirect } from "next/navigation";
import { getDbUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Compliance Log" };

function actionLabel(action: string): string {
  const map: Record<string, string> = {
    PDF_GENERATED: "PDF Generated",
    EMAIL_SENT: "Email Sent",
    DEADLINE_COMPLETED: "Deadline Completed",
    DEADLINE_CREATED: "Deadline Created",
    PROFILE_UPDATED: "Profile Updated",
    REGULATION_ADDED: "Regulation Added",
  };
  return map[action] ?? action;
}

function actionVariant(
  action: string
): "default" | "success" | "warning" | "danger" | "outline" {
  switch (action) {
    case "DEADLINE_COMPLETED":
      return "success";
    case "EMAIL_SENT":
    case "PDF_GENERATED":
      return "default";
    case "DEADLINE_CREATED":
    case "REGULATION_ADDED":
      return "outline";
    default:
      return "outline";
  }
}

export default async function CompliancePage() {
  const user = await getDbUser();
  if (!user) redirect("/sign-in");

  const logs = await prisma.complianceLog.findMany({
    where: { userId: user.id },
    include: {
      regulation: {
        select: { id: true, title: true, trade: true, state: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Compliance Log</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Full audit trail of all compliance actions
        </p>
      </div>

      {logs.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <svg
              className="mb-4 h-12 w-12 text-muted-foreground/50"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z"
              />
            </svg>
            <h3 className="text-lg font-semibold">No activity yet</h3>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Actions like generating PDFs, marking deadlines complete, and
              sending emails will appear here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {logs.map((log) => (
            <div
              key={log.id}
              className="flex items-start gap-4 rounded-lg border border-border bg-background p-4"
            >
              <div className="shrink-0 pt-0.5">
                <Badge variant={actionVariant(log.action)}>
                  {actionLabel(log.action)}
                </Badge>
              </div>
              <div className="flex-1 min-w-0">
                {log.regulation ? (
                  <p className="text-sm font-medium truncate">
                    {log.regulation.title}
                    <span className="ml-2 text-xs font-normal text-muted-foreground">
                      {log.regulation.state} · {log.regulation.trade}
                    </span>
                  </p>
                ) : (
                  <p className="text-sm font-medium text-muted-foreground">
                    Account activity
                  </p>
                )}
                {log.details &&
                  typeof log.details === "object" &&
                  !Array.isArray(log.details) && (
                    <p className="mt-0.5 text-xs text-muted-foreground truncate">
                      {Object.entries(log.details as Record<string, string>)
                        .map(([k, v]) => `${k}: ${v}`)
                        .join(" · ")}
                    </p>
                  )}
              </div>
              <time className="shrink-0 text-xs text-muted-foreground">
                {new Date(log.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </time>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
