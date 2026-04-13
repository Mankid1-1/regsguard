"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import { formatDate, formatRelative, getDeadlineColor, getDaysUntil } from "@/lib/utils/dates";
import type { DeadlineStatus } from "@prisma/client";

export interface DeadlineItem {
  id: string;
  nextDueDate: string;
  status: DeadlineStatus;
  regulation: {
    id: string;
    title: string;
    authority: string;
    trade: string;
    state: string;
    fee: string | null;
    portalUrl: string | null;
    category: string;
  };
}

interface DeadlineCardProps {
  deadline: DeadlineItem;
}

const statusLabels: Record<DeadlineStatus, string> = {
  UPCOMING: "Upcoming",
  DUE_SOON: "Due Soon",
  OVERDUE: "Overdue",
  COMPLETED: "Completed",
  SKIPPED: "Skipped",
};

const statusStyles: Record<DeadlineStatus, string> = {
  UPCOMING: "bg-green-100 text-green-800",
  DUE_SOON: "bg-yellow-100 text-yellow-800",
  OVERDUE: "bg-red-100 text-red-800",
  COMPLETED: "bg-gray-100 text-gray-800",
  SKIPPED: "bg-gray-100 text-gray-500",
};

const borderColors: Record<"red" | "yellow" | "green", string> = {
  red: "border-l-red-500",
  yellow: "border-l-yellow-500",
  green: "border-l-green-500",
};

const tradeLabels: Record<string, string> = {
  PLUMBING: "Plumbing",
  ELECTRICAL: "Electrical",
  HVAC: "HVAC",
  GENERAL: "General",
  EPA: "EPA",
  LEAD_SAFE: "Lead-Safe",
};

export function DeadlineCard({ deadline }: DeadlineCardProps) {
  const dueDate = new Date(deadline.nextDueDate);
  const color = deadline.status === "COMPLETED" || deadline.status === "SKIPPED"
    ? "green"
    : getDeadlineColor(dueDate);
  const daysLeft = getDaysUntil(dueDate);
  const relative = formatRelative(dueDate);

  return (
    <Card
      className={cn(
        "border-l-4 transition-shadow hover:shadow-md",
        borderColors[color]
      )}
    >
      <CardContent className="p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-semibold text-foreground truncate">
                {deadline.regulation.title}
              </h3>
              <span
                className={cn(
                  "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                  statusStyles[deadline.status]
                )}
              >
                {statusLabels[deadline.status]}
              </span>
            </div>

            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              <span>{deadline.regulation.authority}</span>
              <span className="hidden sm:inline">|</span>
              <span>
                {tradeLabels[deadline.regulation.trade] ?? deadline.regulation.trade}{" "}
                ({deadline.regulation.state})
              </span>
              {deadline.regulation.fee && (
                <>
                  <span className="hidden sm:inline">|</span>
                  <span>Fee: {deadline.regulation.fee}</span>
                </>
              )}
            </div>

            <div className="mt-2 flex items-center gap-2 text-sm">
              <span className="font-medium">{formatDate(dueDate)}</span>
              <span className={cn(
                "text-xs",
                daysLeft <= 0 ? "text-red-600 font-semibold" :
                daysLeft <= 7 ? "text-red-500" :
                daysLeft <= 30 ? "text-yellow-600" :
                "text-muted-foreground"
              )}>
                ({relative})
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {deadline.regulation.portalUrl && (
              <a
                href={deadline.regulation.portalUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline" size="sm">
                  View
                </Button>
              </a>
            )}
            <Button variant="secondary" size="sm">
              Generate PDF
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
