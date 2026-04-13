import { NextRequest, NextResponse } from "next/server";
import { getDbUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/user/preferences
 *
 * Returns the current user's display preferences (darkMode, locale).
 */
export async function GET() {
  try {
    const authUser = await getDbUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: authUser.id },
      select: {
        darkMode: true,
        locale: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      darkMode: user.darkMode,
      locale: user.locale,
    });
  } catch (error) {
    console.error("Error fetching preferences:", error);
    return NextResponse.json(
      { error: "Failed to fetch preferences" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/user/preferences
 *
 * Updates the current user's display preferences.
 * Accepts: { darkMode?: boolean, locale?: string }
 */
export async function PUT(request: NextRequest) {
  try {
    const authUser = await getDbUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Validate inputs
    const updateData: Record<string, unknown> = {};

    if (typeof body.darkMode === "boolean") {
      updateData.darkMode = body.darkMode;
    }

    if (typeof body.locale === "string" && body.locale.length >= 2 && body.locale.length <= 10) {
      updateData.locale = body.locale;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update. Accepts: darkMode (boolean), locale (string)." },
        { status: 400 }
      );
    }

    const user = await prisma.user.update({
      where: { id: authUser.id },
      data: updateData,
      select: {
        darkMode: true,
        locale: true,
      },
    });

    return NextResponse.json({
      darkMode: user.darkMode,
      locale: user.locale,
    });
  } catch (error) {
    console.error("Error updating preferences:", error);
    return NextResponse.json(
      { error: "Failed to update preferences" },
      { status: 500 }
    );
  }
}
