/**
 * Date utility functions for deadline tracking.
 */

const MS_PER_DAY = 1000 * 60 * 60 * 24;

/**
 * Returns the urgency color based on how many days remain until the due date.
 *   red    = overdue or <= 7 days remaining
 *   yellow = <= 30 days remaining
 *   green  = > 30 days remaining
 */
export function getDeadlineColor(dueDate: Date): "red" | "yellow" | "green" {
  const days = getDaysUntil(dueDate);
  if (days <= 7) return "red";
  if (days <= 30) return "yellow";
  return "green";
}

/**
 * Returns the number of whole days from today until the due date.
 * Negative values indicate the deadline is overdue.
 */
export function getDaysUntil(dueDate: Date): number {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dueStart = new Date(
    dueDate.getFullYear(),
    dueDate.getMonth(),
    dueDate.getDate()
  );
  return Math.round((dueStart.getTime() - todayStart.getTime()) / MS_PER_DAY);
}

/**
 * Formats a date as "Mar 15, 2026".
 */
export function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Returns a human-readable relative time string.
 *   "today"        if 0 days
 *   "tomorrow"     if 1 day in the future
 *   "yesterday"    if 1 day in the past
 *   "in 5 days"    if positive
 *   "3 days ago"   if negative
 */
export function formatRelative(dueDate: Date): string {
  const days = getDaysUntil(dueDate);

  if (days === 0) return "today";
  if (days === 1) return "tomorrow";
  if (days === -1) return "yesterday";
  if (days > 0) return `in ${days} days`;
  return `${Math.abs(days)} days ago`;
}
