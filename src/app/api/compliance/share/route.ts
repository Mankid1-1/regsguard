import { NextRequest, NextResponse } from "next/server";
import { getDbUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await getDbUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const shares = await prisma.complianceShare.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://app.regsguard.com";

  const result = shares.map((s) => ({
    id: s.id,
    token: s.token,
    label: s.label,
    url: `${appUrl}/compliance/${s.token}`,
    active: s.active,
    viewCount: s.viewCount,
    lastViewedAt: s.lastViewedAt,
    expiresAt: s.expiresAt,
    createdAt: s.createdAt,
  }));

  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  const user = await getDbUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { label?: string; expiresAt?: string } = {};
  try {
    body = await request.json();
  } catch {
    // No body is fine, both fields are optional
  }

  const expiresAt = body.expiresAt ? new Date(body.expiresAt) : null;

  if (expiresAt && isNaN(expiresAt.getTime())) {
    return NextResponse.json(
      { error: "Invalid expiresAt date" },
      { status: 400 }
    );
  }

  const share = await prisma.complianceShare.create({
    data: {
      userId: user.id,
      label: body.label || null,
      expiresAt,
    },
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://app.regsguard.com";
  const url = `${appUrl}/compliance/${share.token}`;

  return NextResponse.json(
    {
      id: share.id,
      token: share.token,
      label: share.label,
      url,
      active: share.active,
      viewCount: share.viewCount,
      expiresAt: share.expiresAt,
      createdAt: share.createdAt,
    },
    { status: 201 }
  );
}

export async function PATCH(request: NextRequest) {
  const user = await getDbUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { id, active } = body;

  if (!id || typeof active !== "boolean") {
    return NextResponse.json(
      { error: "Provide { id: string, active: boolean }" },
      { status: 400 }
    );
  }

  try {
    const share = await prisma.complianceShare.update({
      where: { id, userId: user.id },
      data: { active },
    });

    return NextResponse.json({ id: share.id, active: share.active });
  } catch {
    return NextResponse.json({ error: "Share not found" }, { status: 404 });
  }
}
