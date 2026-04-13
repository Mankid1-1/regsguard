import { NextRequest, NextResponse } from "next/server";
import { checkDeadlines } from "@/lib/cron/deadline-checker";

export async function GET(request: NextRequest) {
  try {
    const cronSecret = request.headers.get("x-cron-secret");
    const expectedSecret = process.env.CRON_SECRET;

    if (!expectedSecret || cronSecret !== expectedSecret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("[CRON] Manual trigger initiated");
    const result = await checkDeadlines();
    console.log(
      `[CRON] Manual trigger done: ${result.checked} checked, ${result.notified} notified, ${result.errors} errors`
    );

    return NextResponse.json({
      success: true,
      ...result,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("[CRON] Manual trigger error:", err);
    return NextResponse.json(
      { error: "Failed to run deadline check" },
      { status: 500 }
    );
  }
}
