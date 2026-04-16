#!/bin/bash
# Deploy RegsGuard to Vercel with Supabase updates
set -e

echo "=== Deploying RegsGuard to Vercel ==="

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "Installing Vercel CLI..."
    npm i -g vercel
fi

# Install dependencies
echo "Installing dependencies..."
npm install

# Generate Prisma client
echo "Generating Prisma client..."
npx prisma generate

# Run database migrations
echo "Running database migrations..."
npx prisma migrate deploy

# Seed database if needed
if [ "$1" = "--seed" ]; then
    echo "Seeding database..."
    npm run seed
fi

# Build the application
echo "Building application..."
npm run build

# Deploy to Vercel
echo "Deploying to Vercel..."
vercel --prod

# Verify deployment
echo "Verifying deployment..."
sleep 5

# Test health endpoint
echo "Testing health endpoint..."
curl -f https://$(vercel ls --scope $VERCEL_ORG | grep $VERCEL_PROJECT | awk '{print $2}')/api/health || {
    echo "Health check failed - check logs"
    vercel logs
    exit 1
}

echo ""
echo "=== Deploy complete! ==="
echo "Application deployed successfully to Vercel"
echo "View logs: vercel logs"
echo "Manage: https://vercel.com/$VERCEL_ORG/$VERCEL_PROJECT"
