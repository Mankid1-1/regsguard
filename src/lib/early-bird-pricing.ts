import { prisma } from "@/lib/prisma";

/**
 * Early-bird pricing: First 100 contractors get $19/mo for life
 * after that, new signups get $29/mo
 */

export async function isEarlyBirdSlotAvailable(): Promise<boolean> {
  const earlyBirdCount = await prisma.subscription.count({
    where: { earlyBirdLocked: true },
  });
  return earlyBirdCount < 100;
}

export async function getEarlyBirdCount(): Promise<number> {
  return prisma.subscription.count({
    where: { earlyBirdLocked: true },
  });
}

export async function lockEarlyBirdPricing(userId: string): Promise<boolean> {
  const available = await isEarlyBirdSlotAvailable();
  if (!available) return false;

  await prisma.subscription.update({
    where: { userId },
    data: {
      pricingTier: "EARLY_BIRD",
      earlyBirdLocked: true,
    },
  });

  return true;
}

export async function getSubscriptionTier(userId: string) {
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
  });

  return {
    tier: subscription?.pricingTier || "STANDARD",
    price: subscription?.pricingTier === "EARLY_BIRD" ? 19 : 29,
    isEarlyBird: subscription?.earlyBirdLocked || false,
  };
}

/**
 * Pricing display for homepage/signup
 */
export async function getPricingDisplay() {
  const earlyBirdCount = await getEarlyBirdCount();
  const slotsRemaining = Math.max(0, 100 - earlyBirdCount);
  const isAvailable = slotsRemaining > 0;

  return {
    monthly: 29,
    annual: 290,
    earlyBird: {
      price: 19,
      available: isAvailable,
      slotsRemaining,
      lockInText: isAvailable
        ? `Only ${slotsRemaining} spots left at $19/mo for life`
        : "Early-bird pricing sold out (500+ contractors at $19/mo)",
    },
  };
}
