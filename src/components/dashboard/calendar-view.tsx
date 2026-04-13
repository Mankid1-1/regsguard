"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils/cn";
import { getDeadlineColor, formatDate } from "@/lib/utils/dates";
import type { DeadlineItem } from "./deadline-card";

interface CalendarViewProps {
  deadlines: DeadlineItem[];
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

export function CalendarView({ deadlines }: CalendarViewProps) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Build a map of date strings to deadlines
  const deadlinesByDate = useMemo(() => {
    const map = new Map<string, DeadlineItem[]>();
    for (const d of deadlines) {
      const date = new Date(d.nextDueDate);
      const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
      const existing = map.get(key) ?? [];
      existing.push(d);
      map.set(key, existing);
    }
    return map;
  }, [deadlines]);

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDayOfWeek = getFirstDayOfWeek(viewYear, viewMonth);

  const goToPrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
    setSelectedDate(null);
  };

  const goToNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
    setSelectedDate(null);
  };

  const goToToday = () => {
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth());
    setSelectedDate(null);
  };

  // Build calendar grid cells
  const cells: Array<{ day: number | null; key: string }> = [];
  for (let i = 0; i < firstDayOfWeek; i++) {
    cells.push({ day: null, key: `empty-${i}` });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, key: `day-${d}` });
  }

  const selectedDeadlines = selectedDate
    ? deadlinesByDate.get(selectedDate) ?? []
    : [];

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Calendar</h2>
        <button
          onClick={goToToday}
          className="text-xs font-medium text-primary hover:underline"
        >
          Today
        </button>
      </div>

      <div className="rounded-lg border border-border bg-background">
        {/* Month header */}
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <button
            onClick={goToPrevMonth}
            className="rounded-md p-1 hover:bg-secondary transition-colors"
            aria-label="Previous month"
          >
            <svg
              className="h-5 w-5 text-muted-foreground"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 19.5L8.25 12l7.5-7.5"
              />
            </svg>
          </button>
          <span className="text-sm font-semibold">
            {MONTH_NAMES[viewMonth]} {viewYear}
          </span>
          <button
            onClick={goToNextMonth}
            className="rounded-md p-1 hover:bg-secondary transition-colors"
            aria-label="Next month"
          >
            <svg
              className="h-5 w-5 text-muted-foreground"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.25 4.5l7.5 7.5-7.5 7.5"
              />
            </svg>
          </button>
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 border-b border-border">
          {WEEKDAYS.map((wd) => (
            <div
              key={wd}
              className="py-2 text-center text-xs font-medium text-muted-foreground"
            >
              {wd}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7">
          {cells.map((cell) => {
            if (cell.day === null) {
              return <div key={cell.key} className="h-14" />;
            }

            const dateKey = `${viewYear}-${viewMonth}-${cell.day}`;
            const dayDeadlines = deadlinesByDate.get(dateKey) ?? [];
            const isToday =
              today.getFullYear() === viewYear &&
              today.getMonth() === viewMonth &&
              today.getDate() === cell.day;
            const isSelected = selectedDate === dateKey;
            const hasDeadlines = dayDeadlines.length > 0;

            // Get the most urgent color for dots
            const dotColors = dayDeadlines.map((d) => {
              if (d.status === "COMPLETED" || d.status === "SKIPPED") return "green";
              return getDeadlineColor(new Date(d.nextDueDate));
            });
            const uniqueColors = [...new Set(dotColors)];

            return (
              <button
                key={cell.key}
                onClick={() =>
                  hasDeadlines
                    ? setSelectedDate(isSelected ? null : dateKey)
                    : undefined
                }
                className={cn(
                  "relative flex h-14 flex-col items-center justify-start border-t border-border pt-1 transition-colors",
                  hasDeadlines && "cursor-pointer hover:bg-secondary",
                  !hasDeadlines && "cursor-default",
                  isSelected && "bg-primary/5"
                )}
              >
                <span
                  className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-full text-xs",
                    isToday && "bg-primary text-primary-foreground font-bold",
                    !isToday && "text-foreground"
                  )}
                >
                  {cell.day}
                </span>
                {hasDeadlines && (
                  <div className="mt-0.5 flex gap-0.5">
                    {uniqueColors.map((c, i) => (
                      <span
                        key={i}
                        className={cn(
                          "h-1.5 w-1.5 rounded-full",
                          c === "red" && "bg-red-500",
                          c === "yellow" && "bg-yellow-500",
                          c === "green" && "bg-green-500"
                        )}
                      />
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected date deadlines */}
      {selectedDate && selectedDeadlines.length > 0 && (
        <div className="mt-4 rounded-lg border border-border bg-background p-4">
          <h3 className="mb-3 text-sm font-semibold text-foreground">
            {formatDate(
              new Date(
                viewYear,
                viewMonth,
                parseInt(selectedDate.split("-")[2])
              )
            )}
          </h3>
          <div className="flex flex-col gap-2">
            {selectedDeadlines.map((d) => {
              const dueDate = new Date(d.nextDueDate);
              const color =
                d.status === "COMPLETED" || d.status === "SKIPPED"
                  ? "green"
                  : getDeadlineColor(dueDate);

              return (
                <div
                  key={d.id}
                  className={cn(
                    "flex items-center gap-3 rounded-md border-l-4 bg-secondary/50 px-3 py-2",
                    color === "red" && "border-l-red-500",
                    color === "yellow" && "border-l-yellow-500",
                    color === "green" && "border-l-green-500"
                  )}
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground truncate">
                      {d.regulation.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {d.regulation.authority} - {d.regulation.state}
                    </p>
                  </div>
                  {d.regulation.portalUrl && (
                    <a
                      href={d.regulation.portalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 text-xs font-medium text-primary hover:underline"
                    >
                      View
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
