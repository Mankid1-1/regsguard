import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET — Retrieve document info for an external signer via token
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; token: string }> }
) {
  const { id, token } = await params;

  const signature = await prisma.signature.findFirst({
    where: {
      token,
      documentId: id,
      status: "PENDING",
    },
    include: {
      document: {
        select: { title: true },
      },
    },
  });

  if (!signature) {
    return NextResponse.json(
      { error: "Invalid or expired signing link" },
      { status: 404 }
    );
  }

  // Check expiration
  if (signature.expiresAt && signature.expiresAt < new Date()) {
    return NextResponse.json(
      { error: "This signing link has expired" },
      { status: 410 }
    );
  }

  return NextResponse.json({
    documentTitle: signature.document.title,
    signerName: signature.signerName,
  });
}

// POST — External signer submits their signature
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; token: string }> }
) {
  const { id, token } = await params;

  const signature = await prisma.signature.findFirst({
    where: {
      token,
      documentId: id,
      status: "PENDING",
    },
  });

  if (!signature) {
    return NextResponse.json(
      { error: "Invalid or expired signing link" },
      { status: 404 }
    );
  }

  if (signature.expiresAt && signature.expiresAt < new Date()) {
    return NextResponse.json(
      { error: "This signing link has expired" },
      { status: 410 }
    );
  }

  let body: { signatureData: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.signatureData) {
    return NextResponse.json(
      { error: "signatureData is required" },
      { status: 400 }
    );
  }

  // Update the signature record
  const updated = await prisma.signature.update({
    where: { id: signature.id },
    data: {
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

  // Check if ALL signatures on this document are now SIGNED
  const pendingCount = await prisma.signature.count({
    where: {
      documentId: id,
      status: { not: "SIGNED" },
    },
  });

  if (pendingCount === 0) {
    await prisma.document.update({
      where: { id },
      data: { status: "SIGNED" },
    });
  }

  // Create compliance log for the document owner
  const document = await prisma.document.findUnique({
    where: { id },
    select: { userId: true, title: true },
  });

  if (document) {
    await prisma.complianceLog.create({
      data: {
        userId: document.userId,
        action: "DOCUMENT_SIGNED",
        details: {
          documentId: id,
          documentTitle: document.title,
          signerName: signature.signerName,
          signatureId: updated.id,
          external: true,
        },
      },
    });
  }

  return NextResponse.json({ success: true, signatureId: updated.id });
}
