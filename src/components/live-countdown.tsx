"use client";

import { useEffect, useState } from "react";

interface LiveCountdownProps {
  targetDate: string | Date;
  /** Show compact (e.g. "3d 4h") vs verbose (e.g. "3 days 4 hours") */
  compact?: boolean;
  /** Hide when target is more than this many days away */
  onlyShowWithin?: number;
}

/**
 * Shows a live, ticking countdown to a target date.
 * Updates every minute (for days/hours), every second when <1 hour.
 */
export function LiveCountdown({ targetDate, compact = true, onlyShowWithin }: LiveCountdownProps) {
  const [now, setNow] = useState(() => Date.now());

  const target = typeof targetDate === "string" ? new Date(targetDate).getTime() : targetDate.getTime();
  const diffMs = target - now;
  const isOverdue = diffMs < 0;
  const absMs = Math.abs(diffMs);

  const days = Math.floor(absMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((absMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((absMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((absMs % (1000 * 60)) / 1000);

  // Tick: every second when under 1 hour, every minute otherwise
  useEffect(() => {
    const interval = absMs < 60 * 60 * 1000 ? 1000 : 60 * 1000;
    const id = setInterval(() => setNow(Date.now()), interval);
    return () => clearInterval(id);
  }, [absMs]);

  if (onlyShowWithin !== undefined && days > onlyShowWithin && !isOverdue) {
    return null;
  }

  // Format
  let display: string;
  if (isOverdue) {
    if (days > 0) display = compact ? `${days}d overdue` : `${days} ${days === 1 ? "day" : "days"} overdue`;
    else if (hours > 0) display = compact ? `${hours}h overdue` : `${hours} ${hours === 1 ? "hour" : "hours"} overdue`;
    else display = "Overdue now";
  } else if (days > 0) {
    if (compact) {
      display = days >= 7 ? `${days}d` : `${days}d ${hours}h`;
    } else {
      display = `${days} ${days === 1 ? "day" : "days"}${days < 7 ? `, ${hours} hr` : ""}`;
    }
  } else if (hours > 0) {
    display = compact ? `${hours}h ${minutes}m` : `${hours} hr ${minutes} min`;
  } else if (minutes > 0) {
    display = compact ? `${minutes}m ${seconds}s` : `${minutes} min ${seconds} sec`;
  } else {
    display = compact ? `${seconds}s` : `${seconds} seconds`;
  }

  const colorClass = isOverdue
    ? "text-red-600 font-semibold"
    : days <= 7
      ? "text-amber-600 font-semibold"
      : days <= 30
        ? "text-amber-700"
        : "text-muted-foreground";

  return (
    <span className={`inline-flex items-center gap-1 tabular-nums ${colorClass}`}>
      {!isOverdue && days <= 7 && (
        <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
      )}
      {display}
    </span>
  );
}
