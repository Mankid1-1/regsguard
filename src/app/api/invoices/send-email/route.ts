import { NextRequest, NextResponse } from "next/server";
import { getDbUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email/send-email";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  const user = await getDbUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const limited = await rateLimit(user.id, { limit: 20, windowSec: 60 });
  if (limited) return limited;

  const body = await request.json();
  const { documentId, email, paymentLink } = body;

  if (!documentId || typeof documentId !== "string") {
    return NextResponse.json({ error: "documentId is required" }, { status: 400 });
  }

  if (!email || typeof email !== "string") {
    return NextResponse.json({ error: "email is required" }, { status: 400 });
  }

  // Verify document belongs to this user
  const document = await prisma.document.findFirst({
    where: { id: documentId, userId: user.id },
  });

  if (!document) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  // Get business profile for sender name
  const profile = await prisma.businessProfile.findUnique({
    where: { userId: user.id },
    select: { businessName: true },
  });

  const senderName = profile?.businessName || user.name || "Your contractor";

  // Build email HTML
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #1e40af;">Invoice from ${senderName}</h2>
      <p>You have received an invoice: <strong>${document.title}</strong></p>
      ${paymentLink ? `
        <p>
          <a href="${paymentLink}" style="display: inline-block; background: #1e40af; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">
            Pay Now
          </a>
        </p>
        <p style="color: #666; font-size: 14px;">Or copy this link: ${paymentLink}</p>
      ` : ""}
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
      <p style="color: #999; font-size: 12px;">Sent via RegsGuard</p>
    </div>
  `;

  const result = await sendEmail({
    to: email,
    subject: `Invoice: ${document.title}`,
    html,
    replyTo: user.email,
  });

  if (!result.success) {
    return NextResponse.json(
      { error: result.error || "Failed to send email" },
      { status: 502 }
    );
  }

  // Update document sent status
  await prisma.document.update({
    where: { id: documentId },
    data: {
      status: "SENT",
      sentAt: new Date(),
      sentTo: email,
    },
  });

  // Log the action
  await prisma.complianceLog.create({
    data: {
      userId: user.id,
      action: "DOCUMENT_SENT",
      details: {
        documentId,
        channel: "EMAIL",
        email,
        hasPaymentLink: !!paymentLink,
      },
    },
  });

  return NextResponse.json({
    success: true,
    message: "Invoice email sent",
    sentTo: email,
  });
}
