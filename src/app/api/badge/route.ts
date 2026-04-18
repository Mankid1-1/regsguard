import { NextResponse } from "next/server";
import { getDbUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateComplianceScore } from "@/lib/compliance-score";
import { randomBytes } from "crypto";

function generateSlug(): string {
  return randomBytes(6).toString("base64url");
}

export async function GET() {
  const user = await getDbUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const me = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      publicBadgeEnabled: true,
      publicBadgeSlug: true,
      complianceScore: true,
      complianceScoreAt: true,
    },
  });

  if (!me) return NextResponse.json({ error: "User not found" }, { status: 404 });

  return NextResponse.json({
    enabled: me.publicBadgeEnabled,
    slug: me.publicBadgeSlug,
    publicUrl: me.publicBadgeSlug
      ? `${process.env.NEXT_PUBLIC_APP_URL || ""}/verified/${me.publicBadgeSlug}`
      : null,
    score: me.complianceScore,
    scoreUpdatedAt: me.complianceScoreAt,
    embedSnippet: me.publicBadgeSlug
      ? `<a href="${process.env.NEXT_PUBLIC_APP_URL || ""}/verified/${me.publicBadgeSlug}" target="_blank" rel="noopener"><img src="${process.env.NEXT_PUBLIC_APP_URL || ""}/api/badge/${me.publicBadgeSlug}/svg" alt="Verified Compliant - RegsGuard" /></a>`
      : null,
  });
}

export async function POST(request: Request) {
  const user = await getDbUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await request.json().catch(() => ({}))) as { enabled?: boolean };
  const enabled = body.enabled !== false;

  const me = await prisma.user.findUnique({
    where: { id: user.id },
    select: { publicBadgeSlug: true },
  });

  let slug = me?.publicBadgeSlug ?? null;
  if (enabled && !slug) {
    let attempts = 0;
    while (attempts < 5) {
      const candidate = generateSlug();
      const existing = await prisma.user.findUnique({
        where: { publicBadgeSlug: candidate },
        select: { id: true },
      });
      if (!existing) {
        slug = candidate;
        break;
      }
      attempts++;
    }
    if (!slug) {
      return NextResponse.json({ error: "Could not allocate badge slug" }, { status: 500 });
    }
  }

  const score = await calculateComplianceScore(user.id);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      publicBadgeEnabled: enabled,
      publicBadgeSlug: slug,
      complianceScore: score,
      complianceScoreAt: new Date(),
    },
  });

  return NextResponse.json({
    enabled,
    slug,
    publicUrl: slug ? `${process.env.NEXT_PUBLIC_APP_URL || ""}/verified/${slug}` : null,
    score,
  });
}
