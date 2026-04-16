-- Enhanced Features Migration
-- Adds tables for intelligent compliance engine and enhanced auto-renewal

-- Create auto-renewal configurations table
CREATE TABLE "AutoRenewalConfig" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "regulationId" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "autoPay" BOOLEAN NOT NULL DEFAULT false,
    "nextRenewalAt" TIMESTAMP(3) NOT NULL,
    "lastRenewedAt" TIMESTAMP(3),
    "failureCount" INTEGER NOT NULL DEFAULT 0,
    "maxRetries" INTEGER NOT NULL DEFAULT 3,
    "strategy" TEXT NOT NULL DEFAULT 'standard',
    "expectedSavings" DECIMAL(10,2) DEFAULT 0,
    "riskLevel" TEXT NOT NULL DEFAULT 'low',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AutoRenewalConfig_pkey" PRIMARY KEY ("id")
);

-- Create compliance logs table for enhanced tracking
CREATE TABLE "ComplianceLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "regulationId" TEXT,
    "action" TEXT NOT NULL,
    "details" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ComplianceLog_pkey" PRIMARY KEY ("id")
);

-- Create error logs table for enhanced monitoring
CREATE TABLE "ErrorLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "error" TEXT NOT NULL,
    "stack" TEXT,
    "context" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ErrorLog_pkey" PRIMARY KEY ("id")
);

-- Add new columns to existing tables for enhanced features
ALTER TABLE "UserDeadline" ADD COLUMN "completedAt" TIMESTAMP(3);
ALTER TABLE "UserDeadline" ADD COLUMN "submissionId" TEXT;
ALTER TABLE "UserDeadline" ADD COLUMN "autoRenewalConfigId" TEXT;

-- Add new columns to Regulation table
ALTER TABLE "Regulation" ADD COLUMN "defaultDueDay" INTEGER DEFAULT 30;
ALTER TABLE "Regulation" ADD COLUMN "renewalCycle" TEXT DEFAULT 'ANNUAL';
ALTER TABLE "Regulation" ADD COLUMN "category" TEXT DEFAULT 'LICENSE';
ALTER TABLE "Regulation" ADD COLUMN "complexity" TEXT DEFAULT 'MEDIUM';

-- Create indexes for performance
CREATE INDEX "AutoRenewalConfig_userId_idx" ON "AutoRenewalConfig"("userId");
CREATE INDEX "AutoRenewalConfig_regulationId_idx" ON "AutoRenewalConfig"("regulationId");
CREATE INDEX "AutoRenewalConfig_nextRenewalAt_idx" ON "AutoRenewalConfig"("nextRenewalAt");
CREATE INDEX "AutoRenewalConfig_enabled_idx" ON "AutoRenewalConfig"("enabled");

CREATE INDEX "ComplianceLog_userId_idx" ON "ComplianceLog"("userId");
CREATE INDEX "ComplianceLog_regulationId_idx" ON "ComplianceLog"("regulationId");
CREATE INDEX "ComplianceLog_action_idx" ON "ComplianceLog"("action");
CREATE INDEX "ComplianceLog_createdAt_idx" ON "ComplianceLog"("createdAt");

CREATE INDEX "ErrorLog_userId_idx" ON "ErrorLog"("userId");
CREATE INDEX "ErrorLog_createdAt_idx" ON "ErrorLog"("createdAt");

CREATE INDEX "UserDeadline_completedAt_idx" ON "UserDeadline"("completedAt");
CREATE INDEX "UserDeadline_submissionId_idx" ON "UserDeadline"("submissionId");
CREATE INDEX "UserDeadline_userId_status_idx" ON "UserDeadline"("userId", "status");
CREATE INDEX "UserDeadline_nextDueDate_status_idx" ON "UserDeadline"("nextDueDate", "status");

CREATE INDEX "Regulation_category_idx" ON "Regulation"("category");
CREATE INDEX "Regulation_complexity_idx" ON "Regulation"("complexity");
CREATE INDEX "Regulation_renewalCycle_idx" ON "Regulation"("renewalCycle");

-- Add foreign key constraints
ALTER TABLE "AutoRenewalConfig" ADD CONSTRAINT "AutoRenewalConfig_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AutoRenewalConfig" ADD CONSTRAINT "AutoRenewalConfig_regulationId_fkey" FOREIGN KEY ("regulationId") REFERENCES "Regulation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ComplianceLog" ADD CONSTRAINT "ComplianceLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ComplianceLog" ADD CONSTRAINT "ComplianceLog_regulationId_fkey" FOREIGN KEY ("regulationId") REFERENCES "Regulation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ErrorLog" ADD CONSTRAINT "ErrorLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "UserDeadline" ADD CONSTRAINT "UserDeadline_autoRenewalConfigId_fkey" FOREIGN KEY ("autoRenewalConfigId") REFERENCES "AutoRenewalConfig"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Create view for enhanced compliance reporting
CREATE VIEW "ComplianceReport" AS
SELECT 
    u.id as userId,
    u.email,
    u.name,
    COUNT(ud.id) as totalDeadlines,
    COUNT(CASE WHEN ud.status = 'COMPLETED' THEN 1 END) as completedDeadlines,
    COUNT(CASE WHEN ud.status = 'OVERDUE' THEN 1 END) as overdueDeadlines,
    COUNT(CASE WHEN ud.status = 'UPCOMING' THEN 1 END) as upcomingDeadlines,
    COUNT(CASE WHEN ud.status = 'DUE_SOON' THEN 1 END) as dueSoonDeadlines,
    COUNT(arc.id) as autoRenewalCount,
    COUNT(CASE WHEN arc.enabled = true THEN 1 END) as enabledAutoRenewals,
    ROUND(
        (COUNT(CASE WHEN ud.status = 'COMPLETED' THEN 1 END) * 100.0 / NULLIF(COUNT(ud.id), 0)), 2
    ) as complianceRate,
    MAX(ud.nextDueDate) as nextDeadline,
    MIN(ud.nextDueDate) as earliestDeadline
FROM "User" u
LEFT JOIN "UserDeadline" ud ON u.id = ud.userId
LEFT JOIN "AutoRenewalConfig" arc ON u.id = arc.userId
GROUP BY u.id, u.email, u.name;

-- Create function for calculating compliance score
CREATE OR REPLACE FUNCTION calculate_compliance_score(user_id TEXT)
RETURNS INTEGER AS $$
DECLARE
    total_deadlines INTEGER;
    completed_deadlines INTEGER;
    overdue_deadlines INTEGER;
    due_soon_deadlines INTEGER;
    score INTEGER := 100;
BEGIN
    -- Count deadlines
    SELECT COUNT(*) INTO total_deadlines
    FROM "UserDeadline"
    WHERE "userId" = user_id;
    
    IF total_deadlines = 0 THEN
        RETURN 0;
    END IF;
    
    -- Count completed deadlines
    SELECT COUNT(*) INTO completed_deadlines
    FROM "UserDeadline"
    WHERE "userId" = user_id AND "status" = 'COMPLETED';
    
    -- Count overdue deadlines
    SELECT COUNT(*) INTO overdue_deadlines
    FROM "UserDeadline"
    WHERE "userId" = user_id 
    AND "nextDueDate" < CURRENT_TIMESTAMP 
    AND "status" NOT IN ('COMPLETED', 'SKIPPED');
    
    -- Count deadlines due soon (within 30 days)
    SELECT COUNT(*) INTO due_soon_deadlines
    FROM "UserDeadline"
    WHERE "userId" = user_id 
    AND "nextDueDate" <= CURRENT_TIMESTAMP + INTERVAL '30 days'
    AND "nextDueDate" >= CURRENT_TIMESTAMP
    AND "status" NOT IN ('COMPLETED', 'SKIPPED');
    
    -- Calculate score
    score := score - (overdue_deadlines * 20);
    score := score - (due_soon_deadlines * 10);
    
    -- Bonus for completed deadlines
    score := score + (completed_deadlines / 5);
    
    -- Ensure score is between 0 and 100
    RETURN GREATEST(0, LEAST(100, score));
END;
$$ LANGUAGE plpgsql;

-- Create trigger for logging compliance actions
CREATE OR REPLACE FUNCTION log_compliance_action()
RETURNS TRIGGER AS $$
BEGIN
    -- Log deadline status changes
    IF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO "ComplianceLog" ("userId", "regulationId", "action", "details")
        VALUES (
            NEW.userId,
            NEW.regulationId,
            CASE 
                WHEN NEW.status = 'COMPLETED' THEN 'DEADLINE_COMPLETED'
                WHEN NEW.status = 'OVERDUE' THEN 'DEADLINE_OVERDUE'
                WHEN NEW.status = 'SKIPPED' THEN 'DEADLINE_SKIPPED'
                ELSE 'DEADLINE_UPDATED'
            END,
            jsonb_build_object(
                'oldStatus', OLD.status,
                'newStatus', NEW.status,
                'nextDueDate', NEW.nextDueDate
            )
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER compliance_log_trigger
    AFTER UPDATE ON "UserDeadline"
    FOR EACH ROW
    EXECUTE FUNCTION log_compliance_action();

-- Add comments for documentation
COMMENT ON TABLE "AutoRenewalConfig" IS 'Configuration for automatic license renewals with intelligent strategies';
COMMENT ON TABLE "ComplianceLog" IS 'Audit log of all compliance-related actions';
COMMENT ON TABLE "ErrorLog" IS 'Error tracking for monitoring and debugging';
COMMENT ON VIEW "ComplianceReport" IS 'Enhanced compliance reporting with metrics and KPIs';
