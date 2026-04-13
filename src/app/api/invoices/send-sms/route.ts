import { NextRequest, NextResponse } from "next/server";
import { getDbUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { guardPermission, PERMISSIONS } from "@/lib/rbac";
import type { Role } from "@prisma/client";

export async function POST(request: NextRequest) {
  const user = await getDbUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const limited = await rateLimit(user.id, { limit: 10, windowSec: 60 });
  if (limited) return limited;

  const denied = guardPermission(user.role as Role, PERMISSIONS.MANAGE_INVOICES);
  if (denied) return denied;

  const body = await request.json();
  const { documentId, phone, paymentLink } = body;

  if (!documentId || typeof documentId !== "string") {
    return NextResponse.json(
      { error: "documentId is required" },
      { status: 400 }
    );
  }

  if (!phone || typeof phone !== "string") {
    return NextResponse.json(
      { error: "phone is required" },
      { status: 400 }
    );
  }

  // Validate phone format (basic US phone check)
  const cleanPhone = phone.replace(/\D/g, "");
  if (cleanPhone.length < 10 || cleanPhone.length > 11) {
    return NextResponse.json(
      { error: "Invalid phone number format" },
      { status: 400 }
    );
  }

  // Verify document belongs to this user
  const document = await prisma.document.findFirst({
    where: { id: documentId, userId: user.id },
  });

  if (!document) {
    return NextResponse.json(
      { error: "Document not found" },
      { status: 404 }
    );
  }

  // Get business profile for the sender name
  const profile = await prisma.businessProfile.findUnique({
    where: { userId: user.id },
    select: { businessName: true },
  });

  const senderName =
    profile?.businessName || user.name || "Your contractor";

  // Build SMS message
  let smsBody = `${senderName} sent you an invoice for: ${document.title}.`;
  if (paymentLink) {
    smsBody += ` Pay here: ${paymentLink}`;
  }

  // Send SMS via Twilio (falls back to dev stub if not configured)
  const { sendSms } = await import("@/lib/sms");
  const smsResult = await sendSms({ to: cleanPhone, body: smsBody });
  if (!smsResult.success) {
    return NextResponse.json(
      { error: smsResult.error || "Failed to send SMS" },
      { status: 502 }
    );
  }

  // Create notification record
  await prisma.notification.create({
    data: {
      userId: user.id,
      type: "SYSTEM",
      title: "Invoice SMS Sent",
      body: `Invoice SMS queued to ${phone} for "${document.title}"`,
      channel: "SMS",
      data: {
        documentId,
        phone: cleanPhone,
        paymentLink: paymentLink || null,
        smsBody,
      },
    },
  });

  // Update document sent status
  await prisma.document.update({
    where: { id: documentId },
    data: {
      status: "SENT",
      sentAt: new Date(),
      sentTo: phone,
    },
  });

  // Log the action
  await prisma.complianceLog.create({
    data: {
      userId: user.id,
      action: "DOCUMENT_SENT",
      details: {
        documentId,
        channel: "SMS",
        phone: cleanPhone,
        hasPaymentLink: !!paymentLink,
      },
    },
  });

  return NextResponse.json({
    success: true,
    message: "Invoice SMS queued for delivery",
    sentTo: phone,
  });
}
