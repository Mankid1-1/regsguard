const MS_PER_DAY = 1000 * 60 * 60 * 24;

export function getDeadlineColor(dueDate: Date): "red" | "yellow" | "green" {
  const days = getDaysUntil(dueDate);
  if (days <= 7) return "red";
  if (days <= 30) return "yellow";
  return "green";
}

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

export function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatRelative(dueDate: Date): string {
  const days = getDaysUntil(dueDate);
  if (days === 0) return "today";
  if (days === 1) return "tomorrow";
  if (days === -1) return "yesterday";
  if (days > 0) return `in ${days} days`;
  return `${Math.abs(days)} days ago`;
}
