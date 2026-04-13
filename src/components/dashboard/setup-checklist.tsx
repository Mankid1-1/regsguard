"use client";

import Link from "next/link";

interface SetupChecklistProps {
  hasProfile: boolean;
  regulationCount: number;
  deadlineCount: number;
  documentCount: number;
}

const steps = [
  {
    key: "profile",
    label: "Complete business profile",
    sublabel: "Auto-fills your forms and PDFs",
    href: "/profile",
    check: (p: SetupChecklistProps) => p.hasProfile,
  },
  {
    key: "regulations",
    label: "Track your regulations",
    sublabel: "Licenses, permits, CE requirements",
    href: "/regulations",
    check: (p: SetupChecklistProps) => p.regulationCount > 0,
  },
  {
    key: "deadlines",
    label: "Review upcoming deadlines",
    sublabel: "We auto-created them from your regulations",
    href: "/regulations",
    check: (p: SetupChecklistProps) => p.deadlineCount > 0,
  },
  {
    key: "documents",
    label: "Generate your first document",
    sublabel: "W-9, lien waiver, permit app -- one click",
    href: "/documents/new",
    check: (p: SetupChecklistProps) => p.documentCount > 0,
  },
];

export function SetupChecklist(props: SetupChecklistProps) {
  const completedCount = steps.filter((s) => s.check(props)).length;
  if (completedCount === steps.length) return null;

  const progress = Math.round((completedCount / steps.length) * 100);

  return (
    <div className="rounded-xl border-2 border-primary/20 bg-primary/5 p-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-bold">Get Started</h2>
        <span className="text-xs font-medium text-primary">{completedCount}/{steps.length} done</span>
      </div>
      <div className="h-2 w-full rounded-full bg-primary/10 mb-4">
        <div
          className="h-2 rounded-full bg-primary transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="space-y-2">
        {steps.map((step) => {
          const done = step.check(props);
          return (
            <Link
              key={step.key}
              href={step.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors ${
                done
                  ? "bg-background/50 opacity-60"
                  : "bg-background hover:bg-accent/50"
              }`}
            >
              <div
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                  done
                    ? "border-green-500 bg-green-500"
                    : "border-muted-foreground/30"
                }`}
              >
                {done && (
                  <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${done ? "line-through" : ""}`}>{step.label}</p>
                <p className="text-xs text-muted-foreground">{step.sublabel}</p>
              </div>
              {!done && (
                <svg className="h-4 w-4 text-muted-foreground shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
