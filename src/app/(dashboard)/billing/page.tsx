import { getDbUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { PricingCard } from "@/components/billing/pricing-card";
import { SubscriptionStatus } from "@/components/billing/subscription-status";

export const metadata = { title: "Billing" };

export default async function BillingPage() {
  const user = await getDbUser();
  if (!user) redirect("/sign-in");

  const subscription = await prisma.subscription.findUnique({
    where: { userId: user.id },
  });

  const soloFeatures = [
    "Up to 10 active deadlines",
    "One-click PDF generation",
    "Email alerts",
    "1 user (no team)",
    "Public Verified Compliant badge",
  ];

  const features = [
    "Unlimited deadline tracking",
    "One-click PDF generation",
    "Auto-send to authorities",
    "Email & SMS alerts",
    "Full compliance audit log",
    "Team accounts (Office Manager, Field Worker)",
    "Vendor portal pre-fill (ISN/Avetta/Veriforce)",
    "Public Verified Compliant badge",
  ];

  // Check if in free trial period (14 days from signup)
  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  const trialEnd = new Date(dbUser!.createdAt.getTime() + 14 * 24 * 60 * 60 * 1000);
  const isInTrial = !subscription && new Date() < trialEnd;

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Billing</h1>
        <p className="text-muted-foreground">Manage your subscription and billing details.</p>
      </div>

      {isInTrial && (
        <div className="rounded-lg border border-primary bg-primary/5 p-4">
          <p className="font-medium">Free Trial Active</p>
          <p className="text-sm text-muted-foreground">
            Your trial ends on {trialEnd.toLocaleDateString()}. Subscribe to continue using RegsGuard.
          </p>
        </div>
      )}

      {subscription ? (
        <SubscriptionStatus
          status={subscription.status}
          currentPeriodEnd={subscription.currentPeriodEnd?.toISOString() ?? null}
          cancelAtPeriodEnd={subscription.cancelAtPeriodEnd}
          plan={
            subscription.stripePriceId === process.env.STRIPE_PRICE_ANNUAL
              ? "Annual"
              : subscription.stripePriceId === process.env.STRIPE_PRICE_SOLO
                ? "Solo"
                : "Monthly"
          }
        />
      ) : (
        <div className="grid gap-6 md:grid-cols-3">
          <PricingCard
            title="Solo"
            price="$19"
            period="mo"
            priceId={process.env.STRIPE_PRICE_SOLO || ""}
            features={soloFeatures}
            badge="One-truck contractor"
          />
          <PricingCard
            title="Monthly"
            price="$29"
            period="mo"
            priceId={process.env.STRIPE_PRICE_MONTHLY || ""}
            features={features}
          />
          <PricingCard
            title="Annual"
            price="$290"
            period="yr"
            priceId={process.env.STRIPE_PRICE_ANNUAL || ""}
            features={features}
            popular
            badge="Save $58/year"
          />
        </div>
      )}
    </div>
  );
}
