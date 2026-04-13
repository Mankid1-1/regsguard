import { NextRequest, NextResponse } from "next/server";
import { getDbUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { guardPermission, PERMISSIONS } from "@/lib/rbac";
import type { Role } from "@prisma/client";
import { stripe } from "@/lib/stripe";

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
  const { documentId, amount, description } = body;

  if (!documentId || typeof documentId !== "string") {
    return NextResponse.json(
      { error: "documentId is required" },
      { status: 400 }
    );
  }

  if (!amount || typeof amount !== "number" || amount <= 0) {
    return NextResponse.json(
      { error: "amount must be a positive number" },
      { status: 400 }
    );
  }

  if (!description || typeof description !== "string") {
    return NextResponse.json(
      { error: "description is required" },
      { status: 400 }
    );
  }

  // Verify the document belongs to this user
  const document = await prisma.document.findFirst({
    where: { id: documentId, userId: user.id },
    include: {
      client: { select: { name: true, email: true } },
    },
  });

  if (!document) {
    return NextResponse.json(
      { error: "Document not found" },
      { status: 404 }
    );
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://app.regsguard.com";

  // If Stripe is configured, create a Checkout Session
  if (stripe) {
    try {
      const checkoutSession = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: description,
                description: `Invoice for ${document.title}`,
              },
              unit_amount: Math.round(amount * 100), // Convert dollars to cents
            },
            quantity: 1,
          },
        ],
        success_url: `${appUrl}/invoices/payment-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${appUrl}/documents/${documentId}`,
        metadata: {
          documentId,
          userId: user.id,
        },
      });

      return NextResponse.json({
        paymentLink: checkoutSession.url,
        provider: "stripe",
        sessionId: checkoutSession.id,
      });
    } catch (err) {
      console.error("[PAYMENT] Stripe checkout error:", err);
      return NextResponse.json(
        { error: "Failed to create Stripe payment link" },
        { status: 500 }
      );
    }
  }

  // Fallback: generate a simple payment page URL (no real payment processing)
  const paymentToken = Buffer.from(
    JSON.stringify({
      documentId,
      amount,
      description,
      createdAt: new Date().toISOString(),
    })
  )
    .toString("base64url")
    .slice(0, 64);

  const fallbackLink = `${appUrl}/invoices/pay/${paymentToken}`;

  return NextResponse.json({
    paymentLink: fallbackLink,
    provider: "manual",
    note: "Stripe is not configured. This is a placeholder payment link.",
  });
}
