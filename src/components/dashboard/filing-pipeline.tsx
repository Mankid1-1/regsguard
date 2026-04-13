"use client";

interface PipelineDeadline {
  id: string;
  status: string;
  nextDueDate: string;
  regulation: {
    id: string;
    title: string;
    authority: string;
    trade: string;
    state: string;
    portalUrl: string | null;
    officialEmail: string | null;
    category: string;
  };
}

const STAGE_CONFIG = {
  OVERDUE: { label: "Overdue", color: "bg-red-500", ring: "ring-red-200" },
  DUE_SOON: { label: "Due Soon", color: "bg-amber-500", ring: "ring-amber-200" },
  UPCOMING: { label: "Upcoming", color: "bg-blue-500", ring: "ring-blue-200" },
} as const;

export function FilingPipeline({ deadlines }: { deadlines: PipelineDeadline[] }) {
  const overdue = deadlines.filter((d) => d.status === "OVERDUE");
  const dueSoon = deadlines.filter((d) => d.status === "DUE_SOON");
  const upcoming = deadlines.filter((d) => d.status === "UPCOMING").slice(0, 5);

  if (deadlines.length === 0) return null;

  const stages = [
    { key: "OVERDUE", items: overdue, ...STAGE_CONFIG.OVERDUE },
    { key: "DUE_SOON", items: dueSoon, ...STAGE_CONFIG.DUE_SOON },
    { key: "UPCOMING", items: upcoming, ...STAGE_CONFIG.UPCOMING },
  ].filter((s) => s.items.length > 0);

  return (
    <div className="rounded-xl border border-border bg-background p-5">
      <div className="flex items-center gap-2 mb-4">
        <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
        </svg>
        <h2 className="text-base font-bold">Filing Pipeline</h2>
      </div>

      <div className="space-y-4">
        {stages.map((stage) => (
          <div key={stage.key}>
            <div className="flex items-center gap-2 mb-2">
              <span className={`inline-block h-2.5 w-2.5 rounded-full ${stage.color}`} />
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {stage.label} ({stage.items.length})
              </span>
            </div>
            <div className="space-y-1.5 pl-5">
              {stage.items.map((d) => (
                <div key={d.id} className="flex items-center gap-3 rounded-lg bg-muted/30 px-3 py-2 text-sm">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{d.regulation.title}</p>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                      <span>{d.regulation.authority}</span>
                      <span>&middot;</span>
                      <span>{d.regulation.state}</span>
                      {d.regulation.officialEmail && (
                        <>
                          <span>&middot;</span>
                          <span className="text-primary truncate" title={`Files to: ${d.regulation.officialEmail}`}>
                            &rarr; {d.regulation.officialEmail}
                          </span>
                        </>
                      )}
                      {!d.regulation.officialEmail && d.regulation.portalUrl && (
                        <>
                          <span>&middot;</span>
                          <span className="text-primary truncate">
                            &rarr; Online portal
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <time className="text-xs text-muted-foreground shrink-0">
                    {new Date(d.nextDueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </time>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
