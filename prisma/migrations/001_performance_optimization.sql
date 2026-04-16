-- Performance Optimization Migration
-- Adds missing indexes for critical query patterns

-- Optimize deadline queries (most frequently accessed)
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_user_deadlines_composite" 
ON "UserDeadline" (userId, status, nextDueDate DESC);

-- Optimize compliance log queries for dashboard
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_compliance_logs_user_action_created" 
ON "ComplianceLog" (userId, action, createdAt DESC);

-- Optimize document queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_documents_user_status_created" 
ON "Document" (userId, status, createdAt DESC);

-- Optimize regulation queries for filtering
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_regulations_active_trade_state" 
ON "Regulation" (active, trade, state);

-- Optimize subscription queries for billing
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_subscriptions_status_tier" 
ON "Subscription" (status, pricingTier);

-- Optimize notification queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_notifications_user_read_created" 
ON "Notification" (userId, read, createdAt DESC);

-- Optimize team member queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_team_members_owner_active" 
ON "TeamMember" (ownerId, active);

-- Optimize expense queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_expenses_user_date_category" 
ON "Expense" (userId, date DESC, category);

-- Optimize project queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_projects_user_status_created" 
ON "Project" (userId, status, createdAt DESC);

-- Optimize client queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_clients_user_created" 
ON "Client" (userId, createdAt DESC);
