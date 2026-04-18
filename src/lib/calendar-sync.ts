/**
 * Google Calendar sync for deadlines
 * Creates read-only calendar that stays synced
 */

export async function generateICSFeed(userId: string): Promise<string> {
  const { prisma } = await import("@/lib/prisma");

  const deadlines = await prisma.userDeadline.findMany({
    where: { userId, status: { notIn: ["COMPLETED", "SKIPPED"] } },
    include: { regulation: { select: { title: true, authority: true } } },
  });

  const now = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

  let ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//RegsGuard//Compliance Calendar//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:Compliance Deadlines
X-WR-TIMEZONE:America/Chicago
X-WR-CALDESC:Your RegsGuard compliance deadlines
BEGIN:VTIMEZONE
TZID:America/Chicago
BEGIN:STANDARD
DTSTART:20231105T020000
TZOFFSETFROM:-0500
TZOFFSETTO:-0600
RRULE:FREQ=YEARLY;BYMONTH=11;BYDAY=1SU
END:STANDARD
BEGIN:DAYLIGHT
DTSTART:20240310T020000
TZOFFSETFROM:-0600
TZOFFSETTO:-0500
RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=2SU
END:DAYLIGHT
END:VTIMEZONE\n`;

  deadlines.forEach((d) => {
    const due = new Date(d.nextDueDate);
    const dueStr = due.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    const alertTime = new Date(due.getTime() - 7 * 24 * 60 * 60 * 1000);
    const alertStr = alertTime.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

    ics += `BEGIN:VEVENT
UID:regsguard-${d.id}@regsguard.rebooked.org
DTSTAMP:${now}
DTSTART;TZID=America/Chicago:${due.toISOString().replace(/[-T:]/g, "").split(".")[0]}
SUMMARY:${d.regulation.title} Due
DESCRIPTION:${d.regulation.title} deadline\\n\\nAuthority: ${d.regulation.authority}\\n\\nGenerate and file at https://regsguard.rebooked.org
LOCATION:https://regsguard.rebooked.org
CATEGORIES:Compliance,RegsGuard
STATUS:CONFIRMED
TRANSP:TRANSPARENT
BEGIN:VALARM
ACTION:DISPLAY
TRIGGER:-P7D
DESCRIPTION:${d.regulation.title} is due in 7 days
END:VALARM
END:VEVENT\n`;
  });

  ics += `END:VCALENDAR`;

  return ics;
}

export function getCalendarSubscriptionUrl(userId: string): string {
  return `https://regsguard.rebooked.org/api/calendar/ics/${userId}`;
}

export function getGoogleCalendarAddUrl(userId: string): string {
  const calendarUrl = encodeURIComponent(getCalendarSubscriptionUrl(userId));
  return `https://calendar.google.com/calendar/u/0/r?cid=${calendarUrl}`;
}

export function getOutlookCalendarAddUrl(userId: string): string {
  const calendarUrl = encodeURIComponent(getCalendarSubscriptionUrl(userId));
  return `https://outlook.office.com/calendar/0/addfromurl?url=${calendarUrl}`;
}

export function getAppleCalendarAddUrl(userId: string): string {
  const calendarUrl = getCalendarSubscriptionUrl(userId);
  return `webcal://${calendarUrl.replace("https://", "")}`;
}
