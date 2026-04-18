import { prisma } from "@/lib/prisma";

/**
 * Referral system: Refer 3 contractors → get 1 month free
 */

export async function generateReferralCode(userId: string): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, email: true },
  });

  if (!user) throw new Error("User not found");

  // Format: FIRST_INITIAL + LAST_INITIAL + _2024 + 4-digit hash
  const nameParts = (user.name || user.email).split(" ");
  const firstInitial = nameParts[0]?.charAt(0).toUpperCase() || "U";
  const lastInitial = (nameParts[1]?.charAt(0) || nameParts[0]?.charAt(1) || "R").toUpperCase();
  const year = new Date().getFullYear();
  const hash = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");

  const code = `${firstInitial}${lastInitial}_${year}_${hash}`;

  // Create referral link
  await prisma.referralLink.create({
    data: {
      userId,
      code,
    },
  });

  return code;
}

export async function createReferral(
  referrerUserId: string,
  referredEmail: string,
  code: string
): Promise<string> {
  const referralLink = await prisma.referralLink.findUnique({
    where: { code },
  });

  if (!referralLink) throw new Error("Invalid referral code");

  const referral = await prisma.userReferral.create({
    data: {
      referrerUserId: referralLink.userId,
      referredEmail,
      code,
      status: "PENDING",
    },
  });

  return referral.id;
}

export async function convertReferral(
  referralId: string,
  referredUserId: string
): Promise<void> {
  const referral = await prisma.userReferral.findUnique({
    where: { id: referralId },
  });

  if (!referral) throw new Error("Referral not found");

  await prisma.userReferral.update({
    where: { id: referralId },
    data: {
      referredUserId,
      status: "CONVERTED",
      conversionDate: new Date(),
    },
  });

  // Check if referrer has 3 conversions → award 1 free month
  const conversions = await prisma.userReferral.count({
    where: {
      referrerUserId: referral.referrerUserId,
      status: "CONVERTED",
    },
  });

  if (conversions % 3 === 0) {
    // Award free month to referrer
    await prisma.subscription.update({
      where: { userId: referral.referrerUserId },
      data: {
        referralMonthsEarned: { increment: 1 },
      },
    });

    // Update referral link stats
    await prisma.referralLink.update({
      where: { userId: referral.referrerUserId },
      data: { conversions: { increment: 1 } },
    });
  }
}

export async function getReferralStats(userId: string) {
  const referralLink = await prisma.referralLink.findFirst({
    where: { userId },
  });

  if (!referralLink) return null;

  const totalReferrals = await prisma.userReferral.count({
    where: { code: referralLink.code },
  });

  const conversions = await prisma.userReferral.count({
    where: { code: referralLink.code, status: "CONVERTED" },
  });

  const subscription = await prisma.subscription.findUnique({
    where: { userId },
  });

  const freeMonthsEarned = subscription?.referralMonthsEarned || 0;
  const freeMonthsRemaining = Math.floor(conversions / 3);

  return {
    code: referralLink.code,
    totalReferrals,
    conversions,
    nextMilestone: 3 - (conversions % 3),
    freeMonthsEarned,
    freeMonthsRemaining,
    shareUrl: `https://regsguard.rebooked.org/signup?ref=${referralLink.code}`,
  };
}
