"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils/cn";

interface Regulation {
  id: string;
  title: string;
  trade: string;
  state: string;
  category: string;
}

interface CECredit {
  id: string;
  courseName: string;
  provider: string | null;
  hours: number;
  completedAt: string;
  regulationId: string | null;
  certificateUrl: string | null;
  notes: string | null;
  regulation: Regulation | null;
}

interface CECreditListProps {
  credits: CECredit[];
  onDelete?: () => void;
  onEdit?: (credit: CECredit) => void;
  requiredHours?: number;
}

export function CECreditList({
  credits,
  onDelete,
  onEdit,
  requiredHours,
}: CECreditListProps) {
  const { toast } = useToast();
  const [deleting, setDeleting] = useState<string | null>(null);

  const totalHours = credits.reduce((sum, c) => sum + c.hours, 0);

  async function handleDelete(id: string) {
    if (!confirm("Delete this CE credit?")) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/ce-credits/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast("CE credit deleted.", "success");
        onDelete?.();
      } else {
        toast("Failed to delete.", "error");
      }
    } catch {
      toast("An error occurred.", "error");
    }
    setDeleting(null);
  }

  if (credits.length === 0) {
    return (
      <Card>
        <CardContent className="py-16 text-center text-muted-foreground">
          <svg
            className="mx-auto h-12 w-12 mb-3 text-muted-foreground/50"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342"
            />
          </svg>
          <p className="text-lg font-semibold mb-1">No CE credits yet</p>
          <p className="text-sm">
            Add your continuing education credits to track your progress.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Progress bar if required hours are set */}
      {requiredHours != null && requiredHours > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground">
                CE Hours Progress
              </span>
              <span className="text-sm text-muted-foreground">
                {totalHours} / {requiredHours} hours
              </span>
            </div>
            <div className="h-3 w-full rounded-full bg-secondary overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  totalHours >= requiredHours
                    ? "bg-success"
                    : totalHours >= requiredHours * 0.5
                      ? "bg-warning"
                      : "bg-danger"
                )}
                style={{
                  width: `${Math.min(100, (totalHours / requiredHours) * 100)}%`,
                }}
              />
            </div>
            {totalHours >= requiredHours && (
              <p className="text-xs text-success mt-1 font-medium">
                Requirement met!
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Credit list */}
      <div className="space-y-3">
        {credits.map((credit) => (
          <Card key={credit.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-medium text-foreground truncate">
                      {credit.courseName}
                    </h3>
                    <Badge variant="default">
                      {credit.hours} {credit.hours === 1 ? "hr" : "hrs"}
                    </Badge>
                  </div>

                  <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
                    {credit.provider && <span>{credit.provider}</span>}
                    <span>
                      {new Date(credit.completedAt).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        }
                      )}
                    </span>
                  </div>

                  {credit.regulation && (
                    <div className="mt-1.5">
                      <Badge variant="outline">
                        {credit.regulation.trade} - {credit.regulation.title}
                      </Badge>
                    </div>
                  )}

                  {credit.notes && (
                    <p className="mt-1.5 text-xs text-muted-foreground line-clamp-2">
                      {credit.notes}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {credit.certificateUrl && (
                    <a
                      href={credit.certificateUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                    >
                      <svg
                        className="h-3.5 w-3.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                        />
                      </svg>
                      Cert
                    </a>
                  )}
                  {onEdit && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onEdit(credit)}
                    >
                      Edit
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive hover:text-destructive"
                    loading={deleting === credit.id}
                    onClick={() => handleDelete(credit.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
