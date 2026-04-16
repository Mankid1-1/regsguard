#!/bin/bash
# Test RegsGuard deployment
set -e

echo "=== Testing RegsGuard Deployment ==="

# Get the deployed URL
if [ -z "$1" ]; then
    echo "Usage: ./scripts/test-deployment.sh <your-app-url.vercel.app>"
    exit 1
fi

APP_URL=$1

echo "Testing deployment at: $APP_URL"

# Test health endpoint
echo "1. Testing health endpoint..."
if curl -f "$APP_URL/api/health" > /dev/null 2>&1; then
    echo "   Health endpoint: OK"
else
    echo "   Health endpoint: FAILED"
    exit 1
fi

# Test intelligent compliance endpoint
echo "2. Testing intelligent compliance endpoint..."
if curl -f "$APP_URL/api/intelligent-compliance" \
    -H "Content-Type: application/json" \
    -d '{"type":"insights"}' \
    -X POST > /dev/null 2>&1; then
    echo "   Intelligent compliance: OK"
else
    echo "   Intelligent compliance: FAILED (may require auth)"
fi

# Test main page
echo "3. Testing main page..."
if curl -f "$APP_URL" > /dev/null 2>&1; then
    echo "   Main page: OK"
else
    echo "   Main page: FAILED"
    exit 1
fi

# Test dashboard page (may redirect)
echo "4. Testing dashboard page..."
if curl -f "$APP_URL/dashboard" > /dev/null 2>&1 || \
   curl -f -L "$APP_URL/dashboard" > /dev/null 2>&1; then
    echo "   Dashboard page: OK"
else
    echo "   Dashboard page: FAILED (may require auth)"
fi

# Test onboarding page
echo "5. Testing onboarding page..."
if curl -f "$APP_URL/onboarding" > /dev/null 2>&1 || \
   curl -f -L "$APP_URL/onboarding" > /dev/null 2>&1; then
    echo "   Onboarding page: OK"
else
    echo "   Onboarding page: FAILED (may require auth)"
fi

# Test API endpoints that don't require auth
echo "6. Testing public API endpoints..."

# Test smart onboarding (will fail without auth, but should return proper error)
if curl "$APP_URL/api/smart-onboarding" \
    -H "Content-Type: application/json" \
    -d '{}' \
    -X POST 2>&1 | grep -q "Unauthorized\|401"; then
    echo "   Smart onboarding auth: OK"
else
    echo "   Smart onboarding auth: FAILED"
fi

# Test cron endpoint (should fail without secret)
if curl "$APP_URL/api/cron/deadline-check" 2>&1 | grep -q "Unauthorized\|401\|403"; then
    echo "   Cron endpoint auth: OK"
else
    echo "   Cron endpoint auth: FAILED"
fi

echo ""
echo "=== Basic tests completed ==="
echo ""
echo "Manual testing checklist:"
echo "1. Visit $APP_URL in browser"
echo "2. Create a test account"
echo "3. Complete smart onboarding"
echo "4. Test intelligent insights on dashboard"
echo "5. Enable auto-renewal for a license"
echo "6. Generate a compliance PDF"
echo "7. Check email notifications"
echo ""
echo "Advanced testing:"
echo "1. Test cron jobs (requires CRON_SECRET)"
echo "2. Test license verification APIs"
echo "3. Test payment processing (requires Stripe keys)"
echo "4. Test performance under load"
echo ""
echo "Monitoring:"
echo "1. Check Vercel logs: vercel logs"
echo "2. Monitor database: Supabase dashboard"
echo "3. Check analytics: Vercel analytics"
