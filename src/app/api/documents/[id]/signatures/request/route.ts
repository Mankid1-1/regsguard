import { NextRequest, NextResponse } from "next/server";
import { getDbUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { guardPermission, PERMISSIONS } from "@/lib/rbac";
import type { Role } from "@prisma/client";
import { randomUUID } from "crypto";

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

  let body: { signerName: string; signerEmail: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.signerName || !body.signerEmail) {
    return NextResponse.json(
      { error: "signerName and signerEmail are required" },
      { status: 400 }
    );
  }

  // Generate a unique token for the signing link
  const token = randomUUID();

  // Create signature record in PENDING state
  const signature = await prisma.signature.create({
    data: {
      documentId: id,
      userId: user.id,
      signerName: body.signerName,
      signerEmail: body.signerEmail,
      signatureData: "",
      status: "PENDING",
      token,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    },
  });

  // Update document status to PENDING_SIGNATURE
  await prisma.document.update({
    where: { id },
    data: { status: "PENDING_SIGNATURE" },
  });

  // Build the signing URL
  const host = request.headers.get("host") || "localhost:3000";
  const protocol = request.headers.get("x-forwarded-proto") || "https";
  const signingUrl = `${protocol}://${host}/api/documents/${id}/sign/${token}`;

  // Try to send email notification (non-blocking, best-effort)
  try {
    const { Resend } = await import("resend");
    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey) {
      const resend = new Resend(resendKey);
      await resend.emails.send({
        from: process.env.FROM_EMAIL || "RegsGuard <noreply@regsguard.com>",
        to: body.signerEmail,
        subject: `Signature requested: ${document.title}`,
        html: `
          <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
            <h2 style="color: #1e40af;">Signature Requested</h2>
            <p>Hi ${body.signerName},</p>
            <p><strong>${user.name || "Someone"}</strong> has requested your signature on:</p>
            <p style="font-size: 18px; font-weight: 600;">${document.title}</p>
            <a href="${signingUrl}" style="display: inline-block; background: #1e40af; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 16px;">
              Sign Document
            </a>
            <p style="margin-top: 24px; font-size: 13px; color: #6b7280;">
              This link expires in 30 days. If you did not expect this request, you can ignore this email.
            </p>
          </div>
        `,
      });
    }
  } catch {
    // Email is best-effort — don't block the request
  }

  return NextResponse.json(
    {
      signatureId: signature.id,
      token: signature.token,
      signingUrl,
    },
    { status: 201 }
  );
}
