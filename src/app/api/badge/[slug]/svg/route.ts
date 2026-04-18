import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function badgeColor(score: number): { bg: string; fg: string; label: string } {
  if (score >= 90) return { bg: "#16a34a", fg: "#ffffff", label: "Excellent" };
  if (score >= 80) return { bg: "#65a30d", fg: "#ffffff", label: "Good" };
  if (score >= 70) return { bg: "#ca8a04", fg: "#ffffff", label: "Fair" };
  if (score >= 60) return { bg: "#ea580c", fg: "#ffffff", label: "Poor" };
  return { bg: "#dc2626", fg: "#ffffff", label: "Critical" };
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const user = await prisma.user.findUnique({
    where: { publicBadgeSlug: slug },
    select: {
      publicBadgeEnabled: true,
      complianceScore: true,
      businessProfile: { select: { businessName: true } },
    },
  });

  if (!user || !user.publicBadgeEnabled) {
    return new NextResponse("Badge not found", { status: 404 });
  }

  const score = user.complianceScore ?? 0;
  const { bg, fg, label } = badgeColor(score);
  const business = user.businessProfile?.businessName ?? "Verified";

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="220" height="64" viewBox="0 0 220 64">
  <defs>
    <linearGradient id="g" x1="0" x2="0" y1="0" y2="1">
      <stop offset="0%" stop-color="${bg}" stop-opacity="1"/>
      <stop offset="100%" stop-color="${bg}" stop-opacity="0.85"/>
    </linearGradient>
  </defs>
  <rect width="220" height="64" rx="8" fill="url(#g)"/>
  <g transform="translate(12, 12)" fill="${fg}">
    <path d="M20 0L0 8v12c0 11 8.5 21.3 20 24 11.5-2.7 20-13 20-24V8L20 0z" opacity="0.95"/>
    <text x="20" y="26" text-anchor="middle" font-family="-apple-system,sans-serif" font-size="14" font-weight="700">${score}</text>
  </g>
  <g transform="translate(58, 0)" fill="${fg}" font-family="-apple-system,sans-serif">
    <text x="0" y="22" font-size="12" font-weight="700" opacity="0.95">VERIFIED COMPLIANT</text>
    <text x="0" y="38" font-size="11" opacity="0.85">${business.slice(0, 22)}</text>
    <text x="0" y="52" font-size="9" opacity="0.7">${label} · RegsGuard</text>
  </g>
</svg>`;

  return new NextResponse(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
