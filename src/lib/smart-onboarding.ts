/**
 * Smart Onboarding System
 * Single-page onboarding with instant value demonstration and intelligent setup
 */

import { prisma } from "./prisma";
import type { Regulation, Trade, User } from "@prisma/client";

export interface BusinessProfileData {
  businessName: string;
  address: string;
  city: string;
  state: 'MN' | 'WI';
  zip: string;
  phone: string;
  email: string;
  responsiblePerson: string;
  licenseNumbers?: Record<string, string>;
}

export interface OnboardingResult {
  success: boolean;
  profile?: BusinessProfileData;
  detectedRegulations?: Regulation[];
  complianceScore?: number;
  immediateDeadlines?: Array<{
    regulation: Regulation;
    daysUntil: number;
    urgency: 'critical' | 'high' | 'medium' | 'low';
  }>;
  estimatedSavings?: {
    timeSaved: string;
    lateFeesAvoided: number;
    stressReduction: string;
  };
  nextSteps?: string[];
  error?: string;
}

/**
 * Extract trades from license numbers using pattern matching
 */
export function extractTradesFromLicenses(licenseNumbers: Record<string, string>): Trade[] {
  const trades: Trade[] = [];
  const patterns = {
    PLUMBING: [/pl/i, /pb/i, /plumbing/i, /plumber/i],
    ELECTRICAL: [/el/i, /ec/i, /electrical/i, /electrician/i, /elec/i],
    HVAC: [/hvac/i, /hvac/i, /mechanical/i, /h/i],
    GENERAL: [/gc/i, /contractor/i, /general/i, /bc/i],
  };

  for (const [licenseType, licenseNumber] of Object.entries(licenseNumbers)) {
    const combinedText = `${licenseType} ${licenseNumber}`.toLowerCase();
    
    for (const [trade, regexPatterns] of Object.entries(patterns)) {
      if (regexPatterns.some(pattern => pattern.test(combinedText))) {
        trades.push(trade as Trade);
        break;
      }
    }
  }

  // Remove duplicates
  return [...new Set(trades)];
}

/**
 * Infer trades from business name
 */
export function inferTradesFromBusinessName(businessName: string): Trade[] {
  const name = businessName.toLowerCase();
  const trades: Trade[] = [];

  if (/plumbing|plumber|pb/.test(name)) trades.push('PLUMBING');
  if (/electrical|electrician|elec|ec/.test(name)) trades.push('ELECTRICAL');
  if (/hvac|mechanical|heating|cooling|air/.test(name)) trades.push('HVAC');
  if (/general|contractor|gc|construction/.test(name)) trades.push('GENERAL');

  return trades;
}

/**
 * Smart regulation detection based on business profile
 */
export async function detectRelevantRegulations(profile: BusinessProfileData): Promise<Regulation[]> {
  const detectedTrades = new Set<Trade>();

  // Extract trades from license numbers
  if (profile.licenseNumbers) {
    const licenseTrades = extractTradesFromLicenses(profile.licenseNumbers);
    licenseTrades.forEach(trade => detectedTrades.add(trade));
  }

  // Infer trades from business name
  const nameTrades = inferTradesFromBusinessName(profile.businessName);
  nameTrades.forEach(trade => detectedTrades.add(trade));

  // If no trades detected, default to GENERAL for the state
  if (detectedTrades.size === 0) {
    detectedTrades.add('GENERAL');
  }

  // Fetch relevant regulations from database
  const regulations = await prisma.regulation.findMany({
    where: {
      state: profile.state,
      trade: { in: Array.from(detectedTrades) },
      active: true,
    },
    orderBy: [
      { category: 'asc' },
      { title: 'asc' },
    ],
  });

  return regulations;
}

/**
 * Calculate immediate compliance score
 */
export function calculateInitialComplianceScore(
  regulations: Regulation[],
  profile: BusinessProfileData
): number {
  let score = 100;
  let totalRequirements = 0;
  let metRequirements = 0;

  // Check each regulation for basic compliance indicators
  for (const regulation of regulations) {
    totalRequirements++;

    // Check if user has relevant license
    const hasLicense = profile.licenseNumbers && 
      Object.values(profile.licenseNumbers).some(license => 
        license && license.length > 0
      );

    // Check if business profile is complete
    const profileComplete = !!(
      profile.businessName &&
      profile.address &&
      profile.city &&
      profile.phone &&
      profile.email
    );

    // Simple scoring logic
    if (hasLicense && profileComplete) {
      metRequirements++;
    } else if (hasLicense || profileComplete) {
      metRequirements += 0.5;
    }
  }

  if (totalRequirements === 0) return 0;
  
  return Math.round((metRequirements / totalRequirements) * 100);
}

/**
 * Identify immediate deadlines and their urgency
 */
export function identifyImmediateDeadlines(regulations: Regulation[]): Array<{
  regulation: Regulation;
  daysUntil: number;
  urgency: 'critical' | 'high' | 'medium' | 'low';
}> {
  const now = new Date();
  const deadlines = [];

  for (const regulation of regulations) {
    // Estimate next due date based on renewal cycle
    let nextDueDate = new Date();
    
    switch (regulation.renewalCycle) {
      case 'ANNUAL':
        nextDueDate.setFullYear(now.getFullYear() + 1);
        break;
      case 'BIENNIAL':
        nextDueDate.setFullYear(now.getFullYear() + 2);
        break;
      case 'TRIENNIAL':
        nextDueDate.setFullYear(now.getFullYear() + 3);
        break;
      case 'FIVE_YEAR':
        nextDueDate.setFullYear(now.getFullYear() + 5);
        break;
      case 'ONE_TIME':
        continue; // Skip one-time regulations
      case 'VARIES':
        // Use default due month if available
        if (regulation.defaultDueMonth) {
          nextDueDate.setMonth(regulation.defaultDueMonth - 1);
          if (nextDueDate <= now) {
            nextDueDate.setFullYear(now.getFullYear() + 1);
          }
        } else {
          nextDueDate.setFullYear(now.getFullYear() + 1);
        }
        break;
    }

    const daysUntil = Math.ceil((nextDueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    let urgency: 'critical' | 'high' | 'medium' | 'low';
    if (daysUntil <= 30) {
      urgency = 'critical';
    } else if (daysUntil <= 60) {
      urgency = 'high';
    } else if (daysUntil <= 90) {
      urgency = 'medium';
    } else {
      urgency = 'low';
    }

    deadlines.push({
      regulation,
      daysUntil,
      urgency,
    });
  }

  return deadlines.sort((a, b) => a.daysUntil - b.daysUntil);
}

/**
 * Calculate estimated savings and benefits
 */
export function calculateEstimatedBenefits(
  regulations: Regulation[],
  profile: BusinessProfileData
): {
  timeSaved: string;
  lateFeesAvoided: number;
  stressReduction: string;
} {
  const regulationCount = regulations.length;
  
  // Estimate time saved (hours per year)
  const timePerRegulation = 4; // Average hours saved per regulation per year
  const totalHoursSaved = regulationCount * timePerRegulation;
  const timeSaved = totalHoursSaved >= 40 
    ? `${Math.round(totalHoursSaved / 40 * 10) / 10} weeks per year`
    : `${totalHoursSaved} hours per year`;

  // Estimate late fees avoided (average $250 per late renewal)
  const avgLateFee = 250;
  const lateFeesAvoided = regulationCount * avgLateFee;

  // Stress reduction (qualitative)
  let stressReduction = 'Significant';
  if (regulationCount <= 2) {
    stressReduction = 'Moderate';
  } else if (regulationCount >= 5) {
    stressReduction = 'Massive';
  }

  return {
    timeSaved,
    lateFeesAvoided,
    stressReduction,
  };
}

/**
 * Generate personalized next steps
 */
export function generateNextSteps(
  regulations: Regulation[],
  profile: BusinessProfileData,
  immediateDeadlines: Array<{ urgency: string }>
): string[] {
  const steps = [];

  // Critical deadlines first
  const criticalDeadlines = immediateDeadlines.filter(d => d.urgency === 'critical');
  if (criticalDeadlines.length > 0) {
    steps.push(`Address ${criticalDeadlines.length} critical deadline${criticalDeadlines.length > 1 ? 's' : ''} within 30 days`);
  }

  // Profile completion
  const missingProfileFields = [];
  if (!profile.licenseNumbers || Object.keys(profile.licenseNumbers).length === 0) {
    missingProfileFields.push('license numbers');
  }
  if (!profile.phone) missingProfileFields.push('phone number');
  if (!profile.address) missingProfileFields.push('address');

  if (missingProfileFields.length > 0) {
    steps.push(`Add ${missingProfileFields.join(', ')} to complete your profile`);
  }

  // Enable auto-renewal
  if (regulations.length > 0) {
    steps.push('Enable auto-renewal for your licenses to never miss a deadline');
  }

  // Team setup
  steps.push('Add team members to share compliance responsibilities');

  // Document setup
  steps.push('Set up document templates for quick generation');

  return steps.slice(0, 4); // Return top 4 next steps
}

/**
 * Complete smart onboarding process
 */
export async function completeSmartOnboarding(
  userId: string,
  profileData: BusinessProfileData
): Promise<OnboardingResult> {
  try {
    // Save business profile
    const profile = await prisma.businessProfile.upsert({
      where: { userId },
      update: {
        businessName: profileData.businessName,
        address: profileData.address,
        city: profileData.city,
        state: profileData.state,
        zip: profileData.zip,
        phone: profileData.phone,
        email: profileData.email,
        responsiblePerson: profileData.responsiblePerson,
        licenseNumbers: profileData.licenseNumbers || {},
      },
      create: {
        userId,
        businessName: profileData.businessName,
        address: profileData.address,
        city: profileData.city,
        state: profileData.state,
        zip: profileData.zip,
        phone: profileData.phone,
        email: profileData.email,
        responsiblePerson: profileData.responsiblePerson,
        licenseNumbers: profileData.licenseNumbers || {},
      },
    });

    // Detect relevant regulations
    const detectedRegulations = await detectRelevantRegulations(profileData);

    // Create user-regulation associations
    await Promise.all(
      detectedRegulations.map(regulation =>
        prisma.userRegulation.upsert({
          where: {
            userId_regulationId: { userId, regulationId: regulation.id },
          },
          update: {},
          create: {
            userId,
            regulationId: regulation.id,
          },
        })
      )
    );

    // Create initial deadlines
    const deadlines = identifyImmediateDeadlines(detectedRegulations);
    await Promise.all(
      deadlines.map(({ regulation }) =>
        prisma.userDeadline.create({
          data: {
            userId,
            regulationId: regulation.id,
            nextDueDate: new Date(Date.now() + Math.random() * 365 * 24 * 60 * 60 * 1000), // Random date within next year
            status: 'UPCOMING',
          },
        })
      )
    );

    // Calculate metrics
    const complianceScore = calculateInitialComplianceScore(detectedRegulations, profileData);
    const benefits = calculateEstimatedBenefits(detectedRegulations, profileData);
    const nextSteps = generateNextSteps(detectedRegulations, profileData, deadlines);

    // Mark onboarding as complete
    await prisma.user.update({
      where: { id: userId },
      data: { onboardingComplete: true },
    });

    return {
      success: true,
      profile: profileData,
      detectedRegulations,
      complianceScore,
      immediateDeadlines: deadlines,
      estimatedSavings: benefits,
      nextSteps,
    };
  } catch (error) {
    console.error('Smart onboarding failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get onboarding progress for existing user
 */
export async function getOnboardingProgress(userId: string): Promise<{
  completed: boolean;
  profile?: BusinessProfileData;
  regulationCount: number;
  deadlineCount: number;
  complianceScore: number;
}> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      businessProfile: true,
      userRegulations: true,
      userDeadlines: true,
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  const regulationCount = user.userRegulations.length;
  const deadlineCount = user.userDeadlines.filter(d => d.status !== 'COMPLETED').length;
  
  let complianceScore = 0;
  if (regulationCount > 0) {
    const completedDeadlines = user.userDeadlines.filter(d => d.status === 'COMPLETED').length;
    complianceScore = Math.round((completedDeadlines / regulationCount) * 100);
  }

  return {
    completed: user.onboardingComplete,
    profile: user.businessProfile || undefined,
    regulationCount,
    deadlineCount,
    complianceScore,
  };
}
