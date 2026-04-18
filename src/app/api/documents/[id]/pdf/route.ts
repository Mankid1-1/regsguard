import { NextRequest, NextResponse } from "next/server";
import { getDbUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { guardPermission, PERMISSIONS } from "@/lib/rbac";
import type { Role } from "@prisma/client";
import { generateDocumentPdf } from "@/lib/documents/generate-document";
import { getTenantFromHeaders } from "@/lib/tenant.server";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getDbUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const limited = await rateLimit(user.id, { limit: 10, windowSec: 60 });
  if (limited) return limited;

  const denied = guardPermission(user.role as Role, PERMISSIONS.MANAGE_DOCUMENTS);
  if (denied) return denied;

  const { id } = await params;
  const doc = await prisma.document.findFirst({
    where: { id, userId: user.id },
  });

  if (!doc) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  const tenant = await getTenantFromHeaders();
  const data = (doc.data && typeof doc.data === "object" && !Array.isArray(doc.data))
    ? doc.data as Record<string, string>
    : {};

  const profile = await prisma.businessProfile.findUnique({ where: { userId: user.id } });
  const userBranding = profile
    ? {
        businessName: profile.businessName,
        logoUrl: profile.logoUrl,
        brandPrimaryColor: profile.brandPrimaryColor,
        brandSecondaryColor: profile.brandSecondaryColor,
        brandFooter: profile.brandFooter,
        supportEmail: profile.email,
      }
    : undefined;

  const { buffer, filename } = await generateDocumentPdf(doc.templateSlug, data, tenant, userBranding);

  // Mark as generated
  await prisma.document.update({
    where: { id },
    data: { status: "GENERATED" },
  });

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
