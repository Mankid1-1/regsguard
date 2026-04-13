"use client";

import { useState } from "react";
import { cn } from "@/lib/utils/cn";
import { DeadlineCard, type DeadlineItem } from "./deadline-card";

type FilterTab = "ALL" | "UPCOMING" | "DUE_SOON" | "OVERDUE";

interface DeadlineListProps {
  deadlines: DeadlineItem[];
}

const tabs: { key: FilterTab; label: string }[] = [
  { key: "ALL", label: "All" },
  { key: "UPCOMING", label: "Upcoming" },
  { key: "DUE_SOON", label: "Due Soon" },
  { key: "OVERDUE", label: "Overdue" },
];

export function DeadlineList({ deadlines }: DeadlineListProps) {
  const [activeTab, setActiveTab] = useState<FilterTab>("ALL");

  const filtered = deadlines
    .filter((d) => {
      if (activeTab === "ALL") return true;
      return d.status === activeTab;
    })
    .sort(
      (a, b) =>
        new Date(a.nextDueDate).getTime() - new Date(b.nextDueDate).getTime()
    );

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">
          Next 90 Days
        </h2>
        <span className="text-sm text-muted-foreground">
          {filtered.length} deadline{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="mb-4 flex gap-1 rounded-lg bg-secondary p-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              activeTab === tab.key
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-8 text-center">
          <svg
            className="mx-auto h-10 w-10 text-muted-foreground"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="mt-2 text-sm text-muted-foreground">
            {activeTab === "ALL"
              ? "No deadlines in the next 90 days. You're all caught up!"
              : `No ${tabs.find((t) => t.key === activeTab)?.label.toLowerCase()} deadlines.`}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((deadline) => (
            <DeadlineCard key={deadline.id} deadline={deadline} />
          ))}
        </div>
      )}
    </div>
  );
}
