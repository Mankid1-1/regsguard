-- Enhanced Features Migration
-- Adds tables for intelligent compliance engine and enhanced auto-renewal

-- Create auto-renewal configurations table
CREATE TABLE IF NOT EXISTS "AutoRenewalConfig" (
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

-- Create index for performance
CREATE INDEX IF NOT EXISTS "AutoRenewalConfig_userId_idx" ON "AutoRenewalConfig"("userId");
CREATE INDEX IF NOT EXISTS "AutoRenewalConfig_regulationId_idx" ON "AutoRenewalConfig"("regulationId");
CREATE INDEX IF NOT EXISTS "AutoRenewalConfig_nextRenewalAt_idx" ON "AutoRenewalConfig"("nextRenewalAt");
CREATE INDEX IF NOT EXISTS "AutoRenewalConfig_enabled_idx" ON "AutoRenewalConfig"("enabled");

-- Create compliance logs table for enhanced tracking
CREATE TABLE IF NOT EXISTS "ComplianceLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "regulationId" TEXT,
    "action" TEXT NOT NULL,
    "details" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ComplianceLog_pkey" PRIMARY KEY ("id")
);

-- Create indexes for compliance logs
CREATE INDEX IF NOT EXISTS "ComplianceLog_userId_idx" ON "ComplianceLog"("userId");
CREATE INDEX IF NOT EXISTS "ComplianceLog_regulationId_idx" ON "ComplianceLog"("regulationId");
CREATE INDEX IF NOT EXISTS "ComplianceLog_action_idx" ON "ComplianceLog"("action");
CREATE INDEX IF NOT EXISTS "ComplianceLog_createdAt_idx" ON "ComplianceLog"("createdAt");

-- Create error logs table for enhanced monitoring
CREATE TABLE IF NOT EXISTS "ErrorLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "error" TEXT NOT NULL,
    "stack" TEXT,
    "context" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ErrorLog_pkey" PRIMARY KEY ("id")
);

-- Create indexes for error logs
CREATE INDEX IF NOT EXISTS "ErrorLog_userId_idx" ON "ErrorLog"("userId");
CREATE INDEX IF NOT EXISTS "ErrorLog_createdAt_idx" ON "ErrorLog"("createdAt");

-- Add foreign key constraints
ALTER TABLE "AutoRenewalConfig" ADD CONSTRAINT "AutoRenewalConfig_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AutoRenewalConfig" ADD CONSTRAINT "AutoRenewalConfig_regulationId_fkey" FOREIGN KEY ("regulationId") REFERENCES "Regulation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ComplianceLog" ADD CONSTRAINT "ComplianceLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ComplianceLog" ADD CONSTRAINT "ComplianceLog_regulationId_fkey" FOREIGN KEY ("regulationId") REFERENCES "Regulation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ErrorLog" ADD CONSTRAINT "ErrorLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Add new columns to existing tables for enhanced features
ALTER TABLE "UserDeadline" ADD COLUMN IF NOT EXISTS "completedAt" TIMESTAMP(3);
ALTER TABLE "UserDeadline" ADD COLUMN IF NOT EXISTS "submissionId" TEXT;
ALTER TABLE "UserDeadline" ADD COLUMN IF NOT EXISTS "autoRenewalConfigId" TEXT;

-- Add indexes for new columns
CREATE INDEX IF NOT EXISTS "UserDeadline_completedAt_idx" ON "UserDeadline"("completedAt");
CREATE INDEX IF NOT EXISTS "UserDeadline_submissionId_idx" ON "UserDeadline"("submissionId");

-- Add foreign key for auto-renewal config
ALTER TABLE "UserDeadline" ADD CONSTRAINT "UserDeadline_autoRenewalConfigId_fkey" FOREIGN KEY ("autoRenewalConfigId") REFERENCES "AutoRenewalConfig"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Update existing regulations with enhanced metadata
ALTER TABLE "Regulation" ADD COLUMN IF NOT EXISTS "defaultDueDay" INTEGER DEFAULT 30;
ALTER TABLE "Regulation" ADD COLUMN IF NOT EXISTS "renewalCycle" TEXT DEFAULT 'ANNUAL';
ALTER TABLE "Regulation" ADD COLUMN IF NOT EXISTS "category" TEXT DEFAULT 'LICENSE';
ALTER TABLE "Regulation" ADD COLUMN IF NOT EXISTS "complexity" TEXT DEFAULT 'MEDIUM';

-- Add indexes for new regulation columns
CREATE INDEX IF NOT EXISTS "Regulation_category_idx" ON "Regulation"("category");
CREATE INDEX IF NOT EXISTS "Regulation_complexity_idx" ON "Regulation"("complexity");
CREATE INDEX IF NOT EXISTS "Regulation_renewalCycle_idx" ON "Regulation"("renewalCycle");

-- Create view for enhanced compliance reporting
CREATE OR REPLACE VIEW "ComplianceReport" AS
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

-- Create function for optimizing renewal timing
CREATE OR REPLACE FUNCTION calculate_optimal_renewal_days(
    regulation_id TEXT,
    user_id TEXT
) RETURNS INTEGER AS $$
DECLARE
    optimal_days INTEGER := 30;
    regulation_record RECORD;
    historical_days INTEGER[];
BEGIN
    -- Get regulation details
    SELECT * INTO regulation_record
    FROM "Regulation"
    WHERE "id" = regulation_id;
    
    IF NOT FOUND THEN
        RETURN 30;
    END IF;
    
    -- Base timing on regulation defaults
    optimal_days := COALESCE(regulation_record.defaultDueDay, 30);
    
    -- Analyze historical patterns
    SELECT ARRAY_AGG(
        EXTRACT(DAY FROM (cl."details"->>'deadlineDate')::timestamp - cl."createdAt")
    ) INTO historical_days
    FROM "ComplianceLog" cl
    WHERE cl."userId" = user_id
    AND cl."regulationId" = regulation_id
    AND cl."action" IN ('MANUAL_RENEWAL', 'AUTO_RENEWAL')
    AND cl."details" ? 'deadlineDate'
    AND EXTRACT(DAY FROM (cl."details"->>'deadlineDate')::timestamp - cl."createdAt") BETWEEN 7 AND 60;
    
    -- Adjust based on historical patterns
    IF array_length(historical_days, 1) > 2 THEN
        optimal_days := ROUND(
            (optimal_days + (
                SELECT AVG(days) 
                FROM unnest(historical_days) AS days
            )) / 2
        );
    END IF;
    
    -- Adjust for regulation category
    IF regulation_record.category = 'TAX' THEN
        optimal_days := optimal_days - 7;  -- Earlier for tax
    ELSIF regulation_record.complexity = 'HIGH' THEN
        optimal_days := optimal_days + 7;  -- Later for complex regulations
    END IF;
    
    -- Ensure reasonable bounds
    RETURN GREATEST(7, LEAST(60, optimal_days));
END;
$$ LANGUAGE plpgsql;

-- Create index for performance optimization
CREATE INDEX IF NOT EXISTS "UserDeadline_userId_status_idx" ON "UserDeadline"("userId", "status");
CREATE INDEX IF NOT EXISTS "UserDeadline_nextDueDate_status_idx" ON "UserDeadline"("nextDueDate", "status");

-- Add comments for documentation
COMMENT ON TABLE "AutoRenewalConfig" IS 'Configuration for automatic license renewals with intelligent strategies';
COMMENT ON TABLE "ComplianceLog" IS 'Audit log of all compliance-related actions';
COMMENT ON TABLE "ErrorLog" IS 'Error tracking for monitoring and debugging';
COMMENT ON VIEW "ComplianceReport" IS 'Enhanced compliance reporting with metrics and KPIs';

-- Grant necessary permissions (adjust for your Supabase setup)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON "AutoRenewalConfig" TO authenticated;
-- GRANT SELECT, INSERT ON "ComplianceLog" TO authenticated;
-- GRANT SELECT, INSERT ON "ErrorLog" TO authenticated;
-- GRANT SELECT ON "ComplianceReport" TO authenticated;
-- GRANT EXECUTE ON FUNCTION calculate_compliance_score(TEXT) TO authenticated;
-- GRANT EXECUTE ON FUNCTION calculate_optimal_renewal_days(TEXT, TEXT) TO authenticated;
