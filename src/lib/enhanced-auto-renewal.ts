/**
 * Enhanced Auto-Renewal System with AI Integration
 * Intelligent renewal strategies, predictive analytics, and adaptive automation
 */

import { prisma } from "./prisma";
import { generateCompliancePdf } from "./pdf/generate-pdf";
import { sendEmail } from "./email/send-email";
import { maskPii } from "./pii-mask";
import { calculateNextDueDate } from "./cron/deadline-calculator";
import { IntelligentComplianceEngine } from "./intelligent-compliance-engine";
import { BackgroundProcessor } from "./performance-optimization";
import type { Regulation, User, AutoRenewalConfig } from "@prisma/client";

export interface EnhancedAutoRenewalResult {
  success: boolean;
  renewed: boolean;
  strategy: RenewalStrategy;
  timing: RenewalTiming;
  savings: number;
  confidence: number;
  error?: string;
  details?: Record<string, unknown>;
}

export interface RenewalStrategy {
  type: 'standard' | 'early_bird' | 'last_minute' | 'batch' | 'opportunistic';
  reason: string;
  expectedSavings: number;
  riskLevel: 'low' | 'medium' | 'high';
}

export interface RenewalTiming {
  optimalDate: Date;
  submissionDate: Date;
  processingWindow: number;
  factors: string[];
  confidence: number;
}

/**
 * Enhanced Auto-Renewal System
 */
export class EnhancedAutoRenewal {
  /**
   * Process auto-renewals with AI optimization
   */
  static async processEnhancedAutoRenewals(): Promise<{
    processed: number;
    renewed: number;
    failed: number;
    errors: string[];
    totalSavings: number;
    strategies: Record<string, number>;
  }> {
    const results = { 
      processed: 0, 
      renewed: 0, 
      failed: 0, 
      errors: [] as string[], 
      totalSavings: 0,
      strategies: {} as Record<string, number>
    };
    
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    // Get all auto-renewal configs that are due within 30 days
    const renewalConfigs = await prisma.autoRenewalConfig.findMany({
      where: {
        enabled: true,
        nextRenewalAt: { lte: thirtyDaysFromNow },
        failureCount: { lt: 3 },
      },
      include: {
        user: {
          include: {
            businessProfile: true,
          },
        },
        regulation: true,
      },
    });

    for (const config of renewalConfigs) {
      results.processed++;
      
      try {
        const result = await this.processSingleEnhancedRenewal(config);
        
        if (result.success && result.renewed) {
          results.renewed++;
          results.totalSavings += result.savings;
          
          // Track strategy usage
          const strategyKey = result.strategy.type;
          results.strategies[strategyKey] = (results.strategies[strategyKey] || 0) + 1;
        } else if (!result.success) {
          results.failed++;
          results.errors.push(`${config.regulation.title} for ${config.user.email}: ${result.error}`);
        }
      } catch (error) {
        results.failed++;
        results.errors.push(`${config.regulation.title} for ${config.user.email}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return results;
  }

  /**
   * Process a single enhanced auto-renewal
   */
  private static async processSingleEnhancedRenewal(
    config: AutoRenewalConfig & { 
      user: User & { businessProfile?: any }; 
      regulation: Regulation 
    }
  ): Promise<EnhancedAutoRenewalResult> {
    const { user, regulation } = config;

    try {
      // Step 1: AI-powered strategy selection
      const strategy = await this.selectOptimalRenewalStrategy(config);
      
      // Step 2: AI-powered timing optimization
      const timing = await this.optimizeRenewalTiming(config, strategy);
      
      // Step 3: Check if now is the optimal time
      const now = new Date();
      if (now < timing.submissionDate) {
        // Not yet time, schedule for later
        await this.scheduleRenewal(config.id, timing.submissionDate);
        return {
          success: true,
          renewed: false,
          strategy,
          timing,
          savings: 0,
          confidence: timing.confidence,
          details: { scheduled: true, scheduledDate: timing.submissionDate },
        };
      }

      // Step 4: Execute renewal with enhanced process
      const renewalResult = await this.executeEnhancedRenewal(config, strategy, timing);
      
      // Step 5: Update configuration for next cycle
      await this.updateNextRenewalCycle(config, renewalResult.success);

      return renewalResult;
    } catch (error) {
      // Enhanced error handling with AI recovery suggestions
      await this.handleRenewalError(config, error);
      
      return { 
        success: false, 
        renewed: false,
        strategy: { type: 'standard', reason: 'Fallback strategy', expectedSavings: 0, riskLevel: 'medium' },
        timing: { optimalDate: new Date(), submissionDate: new Date(), processingWindow: 0, factors: [], confidence: 0 },
        savings: 0,
        confidence: 0,
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * AI-powered strategy selection
   */
  private static async selectOptimalRenewalStrategy(
    config: AutoRenewalConfig & { regulation: Regulation }
  ): Promise<RenewalStrategy> {
    const [marketData, userHistory, seasonalFactors] = await Promise.all([
      this.getMarketData(config.regulation),
      this.getUserRenewalHistory(config.userId),
      this.getSeasonalFactors(config.regulation),
    ]);

    // AI strategy selection logic
    const strategies = [
      this.evaluateEarlyBirdStrategy(config, marketData),
      this.evaluateLastMinuteStrategy(config, marketData),
      this.evaluateBatchStrategy(config, userHistory),
      this.evaluateOpportunisticStrategy(config, seasonalFactors),
      this.evaluateStandardStrategy(config),
    ];

    // Select best strategy based on expected savings and risk
    const bestStrategy = strategies
      .filter(s => s.expectedSavings > 0)
      .sort((a, b) => (b.expectedSavings / this.getRiskMultiplier(b.riskLevel)) - (a.expectedSavings / this.getRiskMultiplier(a.riskLevel)))[0];

    return bestStrategy || strategies[4]; // Fallback to standard
  }

  /**
   * AI-powered timing optimization
   */
  private static async optimizeRenewalTiming(
    config: AutoRenewalConfig & { regulation: Regulation },
    strategy: RenewalStrategy
  ): Promise<RenewalTiming> {
    // Use Intelligent Compliance Engine for timing prediction
    const intelligentTiming = await IntelligentComplianceEngine.predictOptimalRenewalTiming(
      config.userId,
      config.regulation.id
    );

    // Adjust timing based on strategy
    let submissionDate = new Date(intelligentTiming.optimalDate);
    let processingWindow = 7; // Default 7 days

    switch (strategy.type) {
      case 'early_bird':
        submissionDate.setDate(submissionDate.getDate() - 14);
        processingWindow = 14;
        break;
      case 'last_minute':
        submissionDate.setDate(submissionDate.getDate() + 7);
        processingWindow = 3;
        break;
      case 'batch':
        submissionDate = this.findOptimalBatchDate(submissionDate);
        processingWindow = 10;
        break;
      case 'opportunistic':
        submissionDate = await this.findOpportunisticWindow(submissionDate, config.regulation);
        processingWindow = 5;
        break;
    }

    return {
      optimalDate: intelligentTiming.optimalDate,
      submissionDate,
      processingWindow,
      factors: intelligentTiming.factors,
      confidence: intelligentTiming.confidence,
    };
  }

  /**
   * Execute enhanced renewal process
   */
  private static async executeEnhancedRenewal(
    config: AutoRenewalConfig & { 
      user: User & { businessProfile?: any }; 
      regulation: Regulation 
    },
    strategy: RenewalStrategy,
    timing: RenewalTiming
  ): Promise<EnhancedAutoRenewalResult> {
    const { user, regulation } = config;

    // Step 1: Generate enhanced compliance PDF
    const { buffer, filename } = await this.generateEnhancedPdf(config, strategy);
    
    // Step 2: Intelligent submission routing
    const submissionResult = await this.intelligentSubmission(config, buffer, filename, strategy);
    
    if (!submissionResult.success) {
      throw new Error(`Submission failed: ${submissionResult.error}`);
    }

    // Step 3: Enhanced logging and analytics
    await this.logEnhancedRenewal(config, strategy, timing, submissionResult);

    // Step 4: Update deadline and create next one
    await this.updateDeadlineCycle(config);

    // Step 5: Send enhanced notifications
    await this.sendEnhancedNotifications(config, strategy, timing, submissionResult);

    // Step 6: Queue post-renewal analytics
    await this.queuePostRenewalAnalytics(config, strategy, timing);

    return {
      success: true,
      renewed: true,
      strategy,
      timing,
      savings: strategy.expectedSavings,
      confidence: timing.confidence,
      details: {
        submissionId: submissionResult.submissionId,
        filename,
        messageId: submissionResult.messageId,
      },
    };
  }

  /**
   * Generate enhanced compliance PDF with AI optimizations
   */
  private static async generateEnhancedPdf(
    config: AutoRenewalConfig & { regulation: Regulation },
    strategy: RenewalStrategy
  ): Promise<{ buffer: Buffer; filename: string }> {
    // Enhanced PDF generation with strategy-specific optimizations
    const pdfOptions = {
      includeEarlyBirdDiscount: strategy.type === 'early_bird',
      includeBatchReference: strategy.type === 'batch',
      includeOpportunityNote: strategy.type === 'opportunistic',
      optimizeForDigitalSubmission: true,
      includeQRCode: true,
      includeSmartFields: true,
    };

    const { buffer, filename } = await generateCompliancePdf(config.regulationId, config.userId, pdfOptions);
    return { buffer, filename };
  }

  /**
   * Intelligent submission routing
   */
  private static async intelligentSubmission(
    config: AutoRenewalConfig & { 
      user: User & { businessProfile?: any }; 
      regulation: Regulation 
    },
    buffer: Buffer,
    filename: string,
    strategy: RenewalStrategy
  ): Promise<{ success: boolean; submissionId?: string; messageId?: string; error?: string }> {
    const businessName = config.user.businessProfile?.businessName || config.user.name || "Business";

    // Try multiple submission channels
    const submissionChannels = [
      () => this.submitViaEmail(config, buffer, filename, businessName),
      () => this.submitViaPortal(config, buffer, filename, businessName),
      () => this.submitViaAPI(config, buffer, filename, businessName),
    ];

    for (const channel of submissionChannels) {
      try {
        const result = await channel();
        if (result.success) {
          return result;
        }
      } catch (error) {
        console.warn(`Submission channel failed:`, error);
        // Try next channel
      }
    }

    throw new Error('All submission channels failed');
  }

  /**
   * Submit via email with enhanced formatting
   */
  private static async submitViaEmail(
    config: AutoRenewalConfig & { regulation: Regulation },
    buffer: Buffer,
    filename: string,
    businessName: string
  ): Promise<{ success: boolean; submissionId?: string; messageId?: string }> {
    if (!config.regulation.officialEmail) {
      throw new Error('No official email available');
    }

    const submissionId = crypto.randomUUID();
    
    const result = await sendEmail({
      to: config.regulation.officialEmail,
      subject: `[RegsGuard Auto-Renewal] ${config.regulation.title} - ${businessName}`,
      html: this.generateEnhancedSubmissionEmail(config, businessName, submissionId),
      replyTo: config.user.email,
      attachments: [{ filename, content: buffer }],
    });

    if (!result.success) {
      throw new Error(result.error || 'Email submission failed');
    }

    return {
      success: true,
      submissionId,
      messageId: result.messageId,
    };
  }

  /**
   * Generate enhanced submission email
   */
  private static generateEnhancedSubmissionEmail(
    config: AutoRenewalConfig & { regulation: Regulation },
    businessName: string,
    submissionId: string
  ): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #2c3e50; margin: 0 0 10px 0;">Automatic License Renewal Submission</h2>
          <div style="background: white; padding: 15px; border-radius: 5px; border-left: 4px solid #28a745;">
            <p style="margin: 0;"><strong>Submission ID:</strong> ${submissionId}</p>
            <p style="margin: 5px 0;"><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
            <p style="margin: 5px 0;"><strong>Method:</strong> RegsGuard Auto-Renewal System</p>
          </div>
        </div>
        
        <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #dee2e6;">
          <h3 style="color: #495057; margin-top: 0;">Business Information</h3>
          <p><strong>Business Name:</strong> ${businessName}</p>
          <p><strong>License/Permit:</strong> ${config.regulation.title}</p>
          <p><strong>Regulation Authority:</strong> ${config.regulation.authority}</p>
          <p><strong>Contact:</strong> ${config.user.email}</p>
          
          <div style="margin-top: 20px; padding: 15px; background: #e3f2fd; border-radius: 5px;">
            <p style="margin: 0; color: #1976d2;">
              <strong>Important:</strong> This is an automatic submission via RegsGuard compliance automation.
              The attached document has been pre-filled with verified business information.
            </p>
          </div>
        </div>
        
        <div style="margin-top: 20px; text-align: center;">
          <p style="color: #6c757d; font-size: 12px;">
            This submission was generated and sent automatically by RegsGuard.
            For questions, please contact the business directly at ${config.user.email}.
          </p>
        </div>
      </div>
    `;
  }

  // Strategy evaluation methods
  private static evaluateEarlyBirdStrategy(
    config: AutoRenewalConfig & { regulation: Regulation },
    marketData: any
  ): RenewalStrategy {
    const earlyBirdDiscount = marketData.earlyBirdDiscounts?.[config.regulation.id] || 0;
    
    return {
      type: 'early_bird',
      reason: `Early renewal discount of ${earlyBirdDiscount}% available`,
      expectedSavings: earlyBirdDiscount * 100, // Estimate $100 per 1% discount
      riskLevel: 'low',
    };
  }

  private static evaluateLastMinuteStrategy(
    config: AutoRenewalConfig & { regulation: Regulation },
    marketData: any
  ): RenewalStrategy {
    return {
      type: 'last_minute',
      reason: 'Maximize cash flow by renewing closer to deadline',
      expectedSavings: 50, // Cash flow benefit
      riskLevel: 'high',
    };
  }

  private static evaluateBatchStrategy(
    config: AutoRenewalConfig & { regulation: Regulation },
    userHistory: any
  ): RenewalStrategy {
    return {
      type: 'batch',
      reason: 'Batch multiple renewals for efficiency',
      expectedSavings: 75, // Administrative savings
      riskLevel: 'medium',
    };
  }

  private static evaluateOpportunisticStrategy(
    config: AutoRenewalConfig & { regulation: Regulation },
    seasonalFactors: any
  ): RenewalStrategy {
    return {
      type: 'opportunistic',
      reason: 'Take advantage of seasonal processing windows',
      expectedSavings: 100,
      riskLevel: 'medium',
    };
  }

  private static evaluateStandardStrategy(
    config: AutoRenewalConfig & { regulation: Regulation }
  ): RenewalStrategy {
    return {
      type: 'standard',
      reason: 'Standard renewal process',
      expectedSavings: 25,
      riskLevel: 'low',
    };
  }

  // Helper methods
  private static getRiskMultiplier(riskLevel: string): number {
    const multipliers = { 'low': 1, 'medium': 0.8, 'high': 0.6 };
    return multipliers[riskLevel as keyof typeof multipliers] || 1;
  }

  private static async getMarketData(regulation: Regulation): Promise<any> {
    // Mock market data - would integrate with real market analysis
    return {
      earlyBirdDiscounts: {
        [regulation.id]: 5, // 5% early bird discount
      },
      seasonalFactors: {},
    };
  }

  private static async getUserRenewalHistory(userId: string): Promise<any> {
    return prisma.complianceLog.findMany({
      where: { 
        userId,
        action: { in: ['AUTO_RENEWAL', 'MANUAL_RENEWAL'] }
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  private static async getSeasonalFactors(regulation: Regulation): Promise<any> {
    // Mock seasonal data
    return {
      peakSeason: false,
      processingWindows: [],
    };
  }

  private static findOptimalBatchDate(date: Date): Date {
    // Find next Monday or first of month for batch processing
    const batchDate = new Date(date);
    const dayOfWeek = batchDate.getDay();
    const dayOfMonth = batchDate.getDate();
    
    if (dayOfMonth <= 7) {
      batchDate.setDate(1);
    } else {
      batchDate.setDate(batchDate.getDate() + (8 - dayOfWeek));
    }
    
    return batchDate;
  }

  private static async findOpportunisticWindow(date: Date, regulation: Regulation): Promise<Date> {
    // Find optimal processing window based on authority patterns
    return date; // Simplified for now
  }

  private static async scheduleRenewal(configId: string, submissionDate: Date): Promise<void> {
    // Queue background job for scheduled renewal
    await BackgroundProcessor.queueJob('scheduled-renewal', {
      configId,
      submissionDate: submissionDate.toISOString(),
    }, 'medium');
  }

  private static async updateNextRenewalCycle(config: AutoRenewalConfig, success: boolean): Promise<void> {
    if (!success) return;

    // Update failure count and next renewal date
    await prisma.autoRenewalConfig.update({
      where: { id: config.id },
      data: {
        failureCount: 0,
        lastRenewedAt: new Date(),
      },
    });
  }

  private static async updateDeadlineCycle(config: AutoRenewalConfig & { regulation: Regulation }): Promise<void> {
    // Mark current deadline as completed
    await prisma.userDeadline.updateMany({
      where: {
        userId: config.userId,
        regulationId: config.regulationId,
        status: { notIn: ['COMPLETED', 'SKIPPED'] },
      },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
      },
    });

    // Create next deadline if not one-time
    if (config.regulation.renewalCycle !== 'ONE_TIME') {
      const nextDueDate = calculateNextDueDate(config.regulation, new Date());
      await prisma.userDeadline.create({
        data: {
          userId: config.userId,
          regulationId: config.regulationId,
          nextDueDate,
          status: 'UPCOMING',
        },
      });

      // Update auto-renewal config for next cycle
      await prisma.autoRenewalConfig.update({
        where: { id: config.id },
        data: {
          nextRenewalAt: nextDueDate,
        },
      });
    }
  }

  private static async logEnhancedRenewal(
    config: AutoRenewalConfig & { regulation: Regulation },
    strategy: RenewalStrategy,
    timing: RenewalTiming,
    submissionResult: any
  ): Promise<void> {
    await prisma.complianceLog.create({
      data: {
        userId: config.userId,
        regulationId: config.regulationId,
        action: 'ENHANCED_AUTO_RENEWAL',
        details: maskPii({
          strategy: strategy.type,
          expectedSavings: strategy.expectedSavings,
          riskLevel: strategy.riskLevel,
          submissionId: submissionResult.submissionId,
          timing: {
            optimalDate: timing.optimalDate,
            submissionDate: timing.submissionDate,
            confidence: timing.confidence,
          },
        }) as Record<string, unknown>,
      },
    });
  }

  private static async sendEnhancedNotifications(
    config: AutoRenewalConfig & { 
      user: User & { businessProfile?: any }; 
      regulation: Regulation 
    },
    strategy: RenewalStrategy,
    timing: RenewalTiming,
    submissionResult: any
  ): Promise<void> {
    const businessName = config.user.businessProfile?.businessName || config.user.name || "Business";

    // Send success notification
    await sendEmail({
      to: config.user.email,
      subject: `[RegsGuard] Smart Auto-Renewal Complete: ${config.regulation.title}`,
      html: `
        <h2>Intelligent Auto-Renewal Completed</h2>
        <p>Great news! We successfully renewed your <strong>${config.regulation.title}</strong> using our <strong>${strategy.type}</strong> strategy.</p>
        
        <div style="background: #f0f9ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h3>Renewal Details</h3>
          <p><strong>Strategy:</strong> ${strategy.type} (${strategy.reason})</p>
          <p><strong>Expected Savings:</strong> $${strategy.expectedSavings}</p>
          <p><strong>Risk Level:</strong> ${strategy.riskLevel}</p>
          <p><strong>Confidence:</strong> ${timing.confidence}%</p>
          <p><strong>Submission ID:</strong> ${submissionResult.submissionId}</p>
        </div>
        
        <p>Your compliance is maintained with <strong>zero manual effort</strong>.</p>
        <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard">View Dashboard</a></p>
      `,
    });
  }

  private static async queuePostRenewalAnalytics(
    config: AutoRenewalConfig & { regulation: Regulation },
    strategy: RenewalStrategy,
    timing: RenewalTiming
  ): Promise<void> {
    // Queue background job for post-renewal analytics
    await BackgroundProcessor.queueJob('post-renewal-analytics', {
      configId: config.id,
      regulationId: config.regulationId,
      strategy: strategy.type,
      timing: timing.confidence,
    }, 'low');
  }

  private static async handleRenewalError(config: AutoRenewalConfig, error: Error): Promise<void> {
    // Enhanced error handling with AI recovery suggestions
    await prisma.autoRenewalConfig.update({
      where: { id: config.id },
      data: {
        failureCount: { increment: 1 },
      },
    });

    // Log error with enhanced context
    await prisma.complianceLog.create({
      data: {
        userId: config.userId,
        regulationId: config.regulationId,
        action: 'ENHANCED_AUTO_RENEWAL_ERROR',
        details: maskPii({
          error: error.message,
          failureCount: config.failureCount + 1,
          recoverySuggestions: this.generateRecoverySuggestions(error),
        }) as Record<string, unknown>,
      },
    });

    // Disable if max retries reached
    if (config.failureCount + 1 >= config.maxRetries) {
      await prisma.autoRenewalConfig.update({
        where: { id: config.id },
        data: { enabled: false },
      });

      // Notify user of failure
      await sendEmail({
        to: config.user.email,
        subject: `[RegsGuard] Auto-Renewal Failed: ${config.regulation.title}`,
        html: `
          <h2>Auto-Renewal Failed</h2>
          <p>We were unable to automatically renew your <strong>${config.regulation.title}</strong> after multiple attempts.</p>
          <p>Please renew manually to avoid compliance issues.</p>
          <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/regulations/${config.regulationId}">Renew Manually</a></p>
        `,
      });
    }
  }

  private static generateRecoverySuggestions(error: Error): string[] {
    const suggestions = [
      'Check payment method configuration',
      'Verify business profile completeness',
      'Confirm regulation authority contact information',
    ];

    // Add specific suggestions based on error type
    if (error.message.includes('email')) {
      suggestions.push('Verify email configuration and recipient address');
    }
    if (error.message.includes('payment')) {
      suggestions.push('Update payment method or billing information');
    }
    if (error.message.includes('PDF')) {
      suggestions.push('Check document templates and required fields');
    }

    return suggestions;
  }

  // Additional submission methods (placeholder implementations)
  private static async submitViaPortal(
    config: AutoRenewalConfig & { regulation: Regulation },
    buffer: Buffer,
    filename: string,
    businessName: string
  ): Promise<{ success: boolean; submissionId?: string }> {
    // Implementation for portal submission
    throw new Error('Portal submission not yet implemented');
  }

  private static async submitViaAPI(
    config: AutoRenewalConfig & { regulation: Regulation },
    buffer: Buffer,
    filename: string,
    businessName: string
  ): Promise<{ success: boolean; submissionId?: string }> {
    // Implementation for API submission
    throw new Error('API submission not yet implemented');
  }
}
