import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { dispatchNotification } from "@/lib/notifications/dispatcher";

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

export async function POST(request: NextRequest) {
  if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 500 });
  }

  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const userId = session.client_reference_id;
        if (!userId || !session.subscription) break;

        const sub = await stripe.subscriptions.retrieve(session.subscription as string);
        const subData = sub as unknown as { current_period_end: number; items: { data: Array<{ price: { id: string } }> }; status: string };

        await prisma.subscription.upsert({
          where: { userId },
          update: {
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: sub.id,
            stripePriceId: subData.items.data[0]?.price.id,
            status: subData.status === "trialing" ? "TRIALING" : "ACTIVE",
            currentPeriodEnd: new Date(subData.current_period_end * 1000),
          },
          create: {
            userId,
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: sub.id,
            stripePriceId: subData.items.data[0]?.price.id,
            status: subData.status === "trialing" ? "TRIALING" : "ACTIVE",
            currentPeriodEnd: new Date(subData.current_period_end * 1000),
          },
        });
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object;
        const subId = (invoice as unknown as { subscription: string | null }).subscription;
        if (subId) {
          await prisma.subscription.updateMany({
            where: { stripeSubscriptionId: subId },
            data: { status: "ACTIVE" },
          });
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object;
        const subId = (invoice as unknown as { subscription: string | null }).subscription;
        if (subId) {
          await prisma.subscription.updateMany({
            where: { stripeSubscriptionId: subId },
            data: { status: "PAST_DUE" },
          });
        }
        break;
      }

      case "customer.subscription.updated": {
        const sub = event.data.object;
        const subData = sub as unknown as { current_period_end: number; cancel_at_period_end: boolean; status: string };
        await prisma.subscription.updateMany({
          where: { stripeSubscriptionId: sub.id },
          data: {
            status: subData.cancel_at_period_end
              ? "CANCELED"
              : subData.status === "active"
              ? "ACTIVE"
              : subData.status === "trialing"
              ? "TRIALING"
              : "PAST_DUE",
            currentPeriodEnd: new Date(subData.current_period_end * 1000),
            cancelAtPeriodEnd: subData.cancel_at_period_end,
          },
        });
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object;
        await prisma.subscription.updateMany({
          where: { stripeSubscriptionId: sub.id },
          data: { status: "CANCELED" },
        });
        break;
      }

      // Fires 3 days before a trial ends. Nudge the user to confirm their card
      // or cancel if they've decided not to continue.
      case "customer.subscription.trial_will_end": {
        const sub = event.data.object;
        const subData = sub as unknown as { trial_end: number | null };
        const trialEnd = subData.trial_end
          ? new Date(subData.trial_end * 1000)
          : null;

        const record = await prisma.subscription.findFirst({
          where: { stripeSubscriptionId: sub.id },
          select: { userId: true },
        });

        if (record && trialEnd) {
          const daysLeft = Math.max(
            0,
            Math.ceil((trialEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
          );
          await dispatchNotification(
            record.userId,
            "SYSTEM",
            `Your free trial ends in ${daysLeft} days`,
            `Your RegsGuard trial converts to a paid subscription on ${trialEnd.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}. We'll bill the card on file unless you cancel first. Questions? brendan@rebooked.org or (612) 439-7445.`,
            { stripeSubscriptionId: sub.id, trialEnd: trialEnd.toISOString() },
          );
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
