import { NextRequest, NextResponse } from "next/server";
import { processAutoRenewals } from "@/lib/auto-renewal";

export async function GET(request: NextRequest) {
  try {
    const cronSecret = request.headers.get("x-cron-secret");
    const expectedSecret = process.env.CRON_SECRET;

    if (!expectedSecret || cronSecret !== expectedSecret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("[CRON] Auto-renewal processing started");
    const result = await processAutoRenewals();
    console.log(
      `[CRON] Auto-renewal complete: ${result.processed} processed, ${result.renewed} renewed, ${result.failed} failed`
    );

    // Log failures for monitoring
    if (result.errors.length > 0) {
      console.error("[CRON] Auto-renewal errors:", result.errors);
    }

    return NextResponse.json({
      success: true,
      ...result,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("[CRON] Auto-renewal error:", err);
    return NextResponse.json(
      { error: "Failed to process auto-renewals" },
      { status: 500 }
    );
  }
}
