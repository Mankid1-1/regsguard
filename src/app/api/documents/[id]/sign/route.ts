import { NextRequest, NextResponse } from "next/server";
import { getDbUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { guardPermission, PERMISSIONS } from "@/lib/rbac";
import type { Role } from "@prisma/client";

export async function POST(
  request: NextRequest,
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

  // Verify the document belongs to this user
  const document = await prisma.document.findFirst({
    where: { id, userId: user.id },
  });

  if (!document) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  let body: { signatureData: string; signerName: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.signatureData || !body.signerName) {
    return NextResponse.json(
      { error: "signatureData and signerName are required" },
      { status: 400 }
    );
  }

  // Create the signature record
  const signature = await prisma.signature.create({
    data: {
      documentId: id,
      userId: user.id,
      signerName: body.signerName,
      signerEmail: user.email ?? undefined,
      signatureData: body.signatureData,
      status: "SIGNED",
      signedAt: new Date(),
      ipAddress:
        request.headers.get("x-forwarded-for") ??
        request.headers.get("x-real-ip") ??
        null,
      userAgent: request.headers.get("user-agent") ?? null,
    },
  });

  // Owner is signing — update document status directly
  await prisma.document.update({
    where: { id },
    data: { status: "SIGNED" },
  });

  // Create compliance log entry
  await prisma.complianceLog.create({
    data: {
      userId: user.id,
      action: "DOCUMENT_SIGNED",
      details: {
        documentId: id,
        documentTitle: document.title,
        signerName: body.signerName,
        signatureId: signature.id,
      },
    },
  });

  return NextResponse.json(signature, { status: 201 });
}
