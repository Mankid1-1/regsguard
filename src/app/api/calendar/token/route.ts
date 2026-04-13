import { NextResponse } from "next/server";
import { getDbUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { randomUUID } from "crypto";

/**
 * POST /api/calendar/token
 *
 * Generates (or regenerates) a unique calendar feed token for the
 * authenticated user. Returns the full subscribable iCal URL.
 */
export async function POST() {
  const user = await getDbUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const calendarToken = randomUUID();

  await prisma.user.update({
    where: { id: user.id },
    data: { calendarToken },
  });

  // Build the subscribable URL
  const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "https://app.regsguard.com";
  const feedUrl = `${baseUrl}/api/calendar/ical?token=${calendarToken}`;

  // Log the action
  await prisma.complianceLog.create({
    data: {
      userId: user.id,
      action: "PROFILE_UPDATED",
      details: { field: "calendarToken", regenerated: true },
    },
  });

  return NextResponse.json({
    token: calendarToken,
    feedUrl,
    instructions: {
      google: `Open Google Calendar > Settings > Add calendar > From URL > Paste: ${feedUrl}`,
      apple: `Open Calendar.app > File > New Calendar Subscription > Paste: ${feedUrl}`,
      outlook: `Open Outlook > Add Calendar > Subscribe from web > Paste: ${feedUrl}`,
    },
  });
}

/**
 * GET /api/calendar/token
 *
 * Returns the current calendar token and feed URL if one exists.
 */
export async function GET() {
  const user = await getDbUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { calendarToken: true },
  });

  if (!dbUser?.calendarToken) {
    return NextResponse.json({ token: null, feedUrl: null });
  }

  const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "https://app.regsguard.com";
  const feedUrl = `${baseUrl}/api/calendar/ical?token=${dbUser.calendarToken}`;

  return NextResponse.json({
    token: dbUser.calendarToken,
    feedUrl,
  });
}
