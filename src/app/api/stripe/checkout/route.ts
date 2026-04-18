import { NextRequest, NextResponse } from "next/server";
import { getDbUser } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

const TRIAL_DAYS = 14;

export async function POST(request: NextRequest) {
  try {
    const user = await getDbUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!stripe) {
      return NextResponse.json({ error: "Stripe not configured" }, { status: 500 });
    }

    const { priceId } = await request.json();
    if (!priceId) {
      return NextResponse.json({ error: "Price ID required" }, { status: 400 });
    }

    // Reuse existing Stripe customer if we've seen this user before
    const existingSub = await prisma.subscription.findUnique({
      where: { userId: user.id },
    });

    let customerId = existingSub?.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name || undefined,
        metadata: { userId: user.id },
      });
      customerId = customer.id;
    }

    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL?.trim() || "https://regsguard.rebooked.org";

    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      mode: "subscription",

      // Redirects
      success_url: `${appUrl}/billing?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/billing?canceled=true`,
      client_reference_id: user.id,

      // Trial + card-required-at-signup:
      //   - payment_method_collection: "always" forces Stripe to prompt for a
      //     card even when $0 is due today (a 14-day trial with no upfront fee)
      //   - trial_settings.end_behavior.missing_payment_method: "cancel" is a
      //     hard safety net: if a card somehow isn't collected, the sub
      //     cancels automatically when the trial ends instead of leaving a
      //     zombie trialing subscription forever
      payment_method_collection: "always",
      subscription_data: {
        trial_period_days: TRIAL_DAYS,
        trial_settings: {
          end_behavior: { missing_payment_method: "cancel" },
        },
        metadata: { userId: user.id },
      },

      // UX polish
      allow_promotion_codes: true,
      billing_address_collection: "required",
      customer_update: { address: "auto", name: "auto" },
      phone_number_collection: { enabled: true },
      consent_collection: { terms_of_service: "required" },

      // Tell the user exactly what they're agreeing to
      custom_text: {
        submit: {
          message: `You will not be charged during your ${TRIAL_DAYS}-day free trial. Cancel anytime in your billing dashboard. After the trial, your plan renews automatically. Questions? Email brendan@rebooked.org or call (612) 439-7445.`,
        },
        terms_of_service_acceptance: {
          message: `I agree to the [Terms of Service](${appUrl}/terms) and [Privacy Policy](${appUrl}/privacy).`,
        },
      },

      metadata: {
        userId: user.id,
        source: "web_checkout",
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to create checkout";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
