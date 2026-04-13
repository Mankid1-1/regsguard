import type { RenewalCycle } from "@prisma/client";

interface RegulationInput {
  renewalCycle: RenewalCycle;
  defaultDueMonth: number | null;
  defaultDueDay: number | null;
}

/**
 * Computes the next due date for a regulation based on its renewal cycle.
 *
 * If lastCompletedDate is provided, the next due date is calculated by
 * adding the cycle duration to it. If not, it falls back to the regulation's
 * defaultDueMonth/Day for the current or next occurrence.
 *
 * ONE_TIME regulations return a far-future date (2099-12-31).
 * VARIES regulations use the default date or fall back to 1 year from now.
 */
export function calculateNextDueDate(
  regulation: RegulationInput,
  lastCompletedDate?: Date
): Date {
  const { renewalCycle, defaultDueMonth, defaultDueDay } = regulation;

  // ONE_TIME certifications never expire
  if (renewalCycle === "ONE_TIME") {
    return new Date(2099, 11, 31);
  }

  const cycleYears = getCycleYears(renewalCycle);

  // If we have a last-completed date, add the cycle duration
  if (lastCompletedDate) {
    const next = new Date(lastCompletedDate);
    next.setFullYear(next.getFullYear() + cycleYears);
    return next;
  }

  // No last-completed date: use default month/day
  if (defaultDueMonth !== null && defaultDueDay !== null) {
    return getNextDefaultDate(defaultDueMonth, defaultDueDay, cycleYears);
  }

  // No default date either: use today + cycle duration
  const fallback = new Date();
  fallback.setFullYear(fallback.getFullYear() + cycleYears);
  return fallback;
}

/**
 * Returns the number of years for each renewal cycle.
 */
function getCycleYears(cycle: RenewalCycle): number {
  switch (cycle) {
    case "ANNUAL":
      return 1;
    case "BIENNIAL":
      return 2;
    case "TRIENNIAL":
      return 3;
    case "FIVE_YEAR":
      return 5;
    case "ONE_TIME":
      return 0;
    case "VARIES":
      return 1;
  }
}

/**
 * Given a default due month (1-12) and day, returns the next occurrence
 * of that date that is in the future or today.
 *
 * For biennial/triennial/five-year cycles, it finds the next year that
 * matches the cycle pattern from the current year.
 */
function getNextDefaultDate(
  month: number,
  day: number,
  cycleYears: number
): Date {
  const now = new Date();
  const currentYear = now.getFullYear();

  // Try this year's date first
  const thisYear = new Date(currentYear, month - 1, day);
  if (thisYear >= now) {
    return thisYear;
  }

  // This year's date has passed; find the next valid year
  if (cycleYears <= 1) {
    // Annual or varies: just next year
    return new Date(currentYear + 1, month - 1, day);
  }

  // For multi-year cycles, find the next cycle year
  // Start from next year and check each until we find one matching the cycle
  for (let y = currentYear + 1; y <= currentYear + cycleYears; y++) {
    // For biennial WI licenses, even years have the June 30 deadline
    if (cycleYears === 2 && y % 2 === 0) {
      return new Date(y, month - 1, day);
    }
    if (cycleYears === 2 && y % 2 !== 0) {
      continue;
    }
    // For other cycles, just add the cycle
    return new Date(currentYear + cycleYears, month - 1, day);
  }

  // Fallback
  return new Date(currentYear + cycleYears, month - 1, day);
}
