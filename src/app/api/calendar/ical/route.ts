import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/calendar/ical?token=xxx
 *
 * Returns an iCalendar (.ics) feed of the user's compliance deadlines.
 * Designed to be subscribed to from Google Calendar, Apple Calendar, etc.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json(
      { error: "Missing token parameter" },
      { status: 401 }
    );
  }

  // Look up the user by calendar token
  const user = await prisma.user.findUnique({
    where: { calendarToken: token },
    select: { id: true, name: true, email: true },
  });

  if (!user) {
    return NextResponse.json(
      { error: "Invalid calendar token" },
      { status: 401 }
    );
  }

  // Fetch all non-completed deadlines with regulation info
  const deadlines = await prisma.userDeadline.findMany({
    where: {
      userId: user.id,
      status: { notIn: ["COMPLETED", "SKIPPED"] },
    },
    include: {
      regulation: {
        select: {
          title: true,
          authority: true,
          renewalCycle: true,
          description: true,
          category: true,
          state: true,
          trade: true,
        },
      },
    },
    orderBy: { nextDueDate: "asc" },
  });

  // Build iCalendar content
  const now = new Date();
  const dtstamp = formatICalDate(now);
  const calName = `RegsGuard - ${user.name || user.email}`;

  const ical = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//RegsGuard//Compliance Deadlines//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${escapeICalText(calName)}`,
    "X-WR-TIMEZONE:America/New_York",
  ];

  for (const deadline of deadlines) {
    const reg = deadline.regulation;
    const dtstart = formatICalDate(deadline.nextDueDate);
    const uid = `deadline-${deadline.id}@regsguard.com`;

    // Compute the alarm trigger date (7 days before)
    const alarmDate = new Date(deadline.nextDueDate);
    alarmDate.setDate(alarmDate.getDate() - 7);

    const renewalLabel = formatRenewalCycle(reg.renewalCycle);
    const description = [
      `Authority: ${reg.authority}`,
      `Renewal: ${renewalLabel}`,
      `State: ${reg.state} | Trade: ${formatTrade(reg.trade)}`,
      `Category: ${formatCategory(reg.category)}`,
      reg.description ? `\\n${reg.description}` : "",
    ]
      .filter(Boolean)
      .join("\\n");

    ical.push(
      "BEGIN:VEVENT",
      `UID:${uid}`,
      `DTSTAMP:${dtstamp}`,
      `DTSTART;VALUE=DATE:${formatICalDateOnly(deadline.nextDueDate)}`,
      `DTEND;VALUE=DATE:${formatICalDateOnly(addDays(deadline.nextDueDate, 1))}`,
      `SUMMARY:${escapeICalText(reg.title)}`,
      `DESCRIPTION:${escapeICalText(description)}`,
      "STATUS:CONFIRMED",
      "TRANSP:TRANSPARENT",
      // 7-day reminder alarm
      "BEGIN:VALARM",
      "TRIGGER:-P7D",
      "ACTION:DISPLAY",
      `DESCRIPTION:Reminder: ${escapeICalText(reg.title)} is due in 7 days`,
      "END:VALARM",
      // 1-day reminder alarm
      "BEGIN:VALARM",
      "TRIGGER:-P1D",
      "ACTION:DISPLAY",
      `DESCRIPTION:Reminder: ${escapeICalText(reg.title)} is due tomorrow`,
      "END:VALARM",
      "END:VEVENT"
    );
  }

  ical.push("END:VCALENDAR");

  const body = ical.join("\r\n");

  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'inline; filename="regsguard-deadlines.ics"',
      "Cache-Control": "no-cache, no-store, must-revalidate",
    },
  });
}

// ── Helpers ──

function formatICalDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

function formatICalDateOnly(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}${m}${d}`;
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function escapeICalText(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

function formatRenewalCycle(cycle: string): string {
  const map: Record<string, string> = {
    ANNUAL: "Annual",
    BIENNIAL: "Every 2 years",
    TRIENNIAL: "Every 3 years",
    FIVE_YEAR: "Every 5 years",
    ONE_TIME: "One-time",
    VARIES: "Varies",
  };
  return map[cycle] || cycle;
}

function formatTrade(trade: string): string {
  const map: Record<string, string> = {
    PLUMBING: "Plumbing",
    ELECTRICAL: "Electrical",
    HVAC: "HVAC",
    GENERAL: "General",
    EPA: "EPA",
    LEAD_SAFE: "Lead-Safe",
  };
  return map[trade] || trade;
}

function formatCategory(category: string): string {
  return category
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
