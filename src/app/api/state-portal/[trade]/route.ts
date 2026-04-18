import { NextRequest, NextResponse } from "next/server";
import { STATE_PORTALS, type StateCode, type Trade } from "@/lib/state-portals";

const VALID_STATES: StateCode[] = ["MN", "WI"];
const VALID_TRADES: Trade[] = ["PLUMBING", "ELECTRICAL", "HVAC", "GENERAL", "EPA", "LEAD_SAFE"];

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ trade: string }> }
) {
  const { trade: tradeParam } = await params;
  const trade = tradeParam.toUpperCase() as Trade;
  const stateParam = (request.nextUrl.searchParams.get("state") ?? "").toUpperCase() as StateCode;

  if (!VALID_TRADES.includes(trade)) {
    return NextResponse.json(
      { error: `Invalid trade. Valid: ${VALID_TRADES.join(", ")}` },
      { status: 400 }
    );
  }

  if (stateParam && !VALID_STATES.includes(stateParam)) {
    return NextResponse.json(
      { error: `Invalid state. Currently supported: ${VALID_STATES.join(", ")}` },
      { status: 400 }
    );
  }

  const portals = STATE_PORTALS.filter(
    (p) => p.trade === trade && (!stateParam || p.state === stateParam)
  );

  return NextResponse.json(portals);
}
