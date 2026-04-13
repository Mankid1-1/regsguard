"use client";

interface ActivityItem {
  id: string;
  action: string;
  createdAt: string;
  regulation: { title: string; authority: string } | null;
  details: Record<string, unknown> | null;
}

const ACTION_LABELS: Record<string, { label: string; color: string }> = {
  PDF_GENERATED: { label: "PDF Generated", color: "text-blue-600 bg-blue-50" },
  EMAIL_SENT: { label: "Filed", color: "text-green-600 bg-green-50" },
  DEADLINE_COMPLETED: { label: "Completed", color: "text-green-700 bg-green-50" },
  DEADLINE_CREATED: { label: "Deadline Set", color: "text-indigo-600 bg-indigo-50" },
  PROFILE_UPDATED: { label: "Profile Updated", color: "text-gray-600 bg-gray-50" },
  REGULATION_ADDED: { label: "Regulation Added", color: "text-purple-600 bg-purple-50" },
  DOCUMENT_CREATED: { label: "Document Created", color: "text-blue-600 bg-blue-50" },
  DOCUMENT_SENT: { label: "Document Sent", color: "text-green-600 bg-green-50" },
};

export function FilingHistory({ activity }: { activity: ActivityItem[] }) {
  if (activity.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-background p-6">
        <h2 className="text-lg font-semibold mb-2">Filing History</h2>
        <p className="text-sm text-muted-foreground">
          No compliance activity yet. Once you start filing, your audit trail will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-background p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Filing History &amp; Audit Trail</h2>
        <span className="text-xs text-muted-foreground">{activity.length} recent actions</span>
      </div>
      <div className="space-y-3">
        {activity.map((item) => {
          const config = ACTION_LABELS[item.action] ?? { label: item.action, color: "text-gray-600 bg-gray-50" };
          const isAutoFiled = item.details?.autoFiled === true;
          const sentTo = item.details?.sentTo as string | undefined;

          return (
            <div key={item.id} className="flex items-start gap-3 text-sm">
              <div className="mt-0.5 shrink-0">
                <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${config.color}`}>
                  {isAutoFiled ? "Auto-Filed" : config.label}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">
                  {item.regulation?.title ?? (item.details?.title as string) ?? "System"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {item.regulation?.authority}
                  {sentTo && <> &middot; Sent to {sentTo}</>}
                </p>
              </div>
              <time className="text-xs text-muted-foreground shrink-0">
                {new Date(item.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </time>
            </div>
          );
        })}
      </div>
    </div>
  );
}
