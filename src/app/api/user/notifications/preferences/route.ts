import { NextRequest, NextResponse } from "next/server";
import { getDbUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const DEFAULT_ALERT_DAYS = [60, 30, 14, 7, 1];

export async function GET() {
  try {
    const user = await getDbUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Return existing preferences or create defaults
    const prefs = await prisma.notificationPreference.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        emailEnabled: true,
        smsEnabled: false,
        pushEnabled: true,
        inAppEnabled: true,
        alertDays: DEFAULT_ALERT_DAYS,
      },
    });

    return NextResponse.json(prefs);
  } catch (error) {
    console.error("Error fetching notification preferences:", error);
    return NextResponse.json(
      { error: "Failed to fetch notification preferences" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getDbUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const {
      emailEnabled,
      smsEnabled,
      pushEnabled,
      inAppEnabled,
      smsPhone,
      alertDays,
      quietHoursStart,
      quietHoursEnd,
    } = body;

    // Build update data, only including fields that were provided
    const updateData: Record<string, unknown> = {};

    if (typeof emailEnabled === "boolean") updateData.emailEnabled = emailEnabled;
    if (typeof smsEnabled === "boolean") updateData.smsEnabled = smsEnabled;
    if (typeof pushEnabled === "boolean") updateData.pushEnabled = pushEnabled;
    if (typeof inAppEnabled === "boolean") updateData.inAppEnabled = inAppEnabled;
    if (smsPhone !== undefined) updateData.smsPhone = smsPhone || null;
    if (alertDays !== undefined) {
      if (!Array.isArray(alertDays) || !alertDays.every((d: unknown) => typeof d === "number" && d > 0)) {
        return NextResponse.json(
          { error: "alertDays must be an array of positive numbers" },
          { status: 400 }
        );
      }
      updateData.alertDays = alertDays;
    }
    if (quietHoursStart !== undefined) updateData.quietHoursStart = quietHoursStart || null;
    if (quietHoursEnd !== undefined) updateData.quietHoursEnd = quietHoursEnd || null;

    const prefs = await prisma.notificationPreference.upsert({
      where: { userId: user.id },
      update: updateData,
      create: {
        userId: user.id,
        emailEnabled: typeof emailEnabled === "boolean" ? emailEnabled : true,
        smsEnabled: typeof smsEnabled === "boolean" ? smsEnabled : false,
        pushEnabled: typeof pushEnabled === "boolean" ? pushEnabled : true,
        inAppEnabled: typeof inAppEnabled === "boolean" ? inAppEnabled : true,
        smsPhone: smsPhone || null,
        alertDays: alertDays ?? DEFAULT_ALERT_DAYS,
        quietHoursStart: quietHoursStart || null,
        quietHoursEnd: quietHoursEnd || null,
      },
    });

    return NextResponse.json(prefs);
  } catch (error) {
    console.error("Error updating notification preferences:", error);
    return NextResponse.json(
      { error: "Failed to update notification preferences" },
      { status: 500 }
    );
  }
}
