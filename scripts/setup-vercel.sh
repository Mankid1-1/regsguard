#!/bin/bash
# Initial Vercel setup for RegsGuard
set -e

echo "=== Setting up RegsGuard for Vercel deployment ==="

# Check prerequisites
echo "Checking prerequisites..."

if ! command -v node &> /dev/null; then
    echo "Node.js is required. Please install Node.js 18+"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "npm is required. Please install npm"
    exit 1
fi

# Install dependencies
echo "Installing dependencies..."
npm install

# Generate Prisma client
echo "Generating Prisma client..."
npx prisma generate

# Install Vercel CLI
if ! command -v vercel &> /dev/null; then
    echo "Installing Vercel CLI..."
    npm i -g vercel
fi

# Login to Vercel
echo "Please login to Vercel..."
vercel login

# Link project
echo "Linking project to Vercel..."
vercel link

# Set up environment variables
echo "Setting up environment variables..."

read -p "Enter your DATABASE_URL: " DATABASE_URL
vercel env add DATABASE_URL production

read -p "Enter your NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: " CLERK_PUBLISHABLE
vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY production

read -p "Enter your CLERK_SECRET_KEY: " CLERK_SECRET
vercel env add CLERK_SECRET_KEY production

read -p "Enter your RESEND_API_KEY: " RESEND_API_KEY
vercel env add RESEND_API_KEY production

read -p "Enter your STRIPE_SECRET_KEY: " STRIPE_SECRET
vercel env add STRIPE_SECRET_KEY production

read -p "Enter your STRIPE_PUBLISHABLE_KEY: " STRIPE_PUBLISHABLE
vercel env add STRIPE_PUBLISHABLE_KEY production

read -p "Enter your CRON_SECRET (generate with: openssl rand -hex 32): " CRON_SECRET
vercel env add CRON_SECRET production

read -p "Enter your production URL (e.g., https://your-app.vercel.app): " APP_URL
vercel env add NEXT_PUBLIC_APP_URL production

# Optional: License verification APIs
echo ""
echo "Optional: License verification API keys (press Enter to skip)"
read -p "MINNESOTA_DLI_API_KEY: " MN_DLI
if [ ! -z "$MN_DLI" ]; then
    vercel env add MINNESOTA_DLI_API_KEY production
fi

read -p "WISCONSIN_DSPS_API_KEY: " WI_DSPS
if [ ! -z "$WI_DSPS" ]; then
    vercel env add WISCONSIN_DSPS_API_KEY production
fi

# Test database connection
echo "Testing database connection..."
if npx prisma db pull --force > /dev/null 2>&1; then
    echo "Database connection successful"
else
    echo "Database connection failed. Please check your DATABASE_URL"
    exit 1
fi

# Run migrations
echo "Running database migrations..."
npx prisma migrate deploy

# Build test
echo "Testing build..."
npm run build

echo ""
echo "=== Setup complete! ==="
echo ""
echo "Next steps:"
echo "1. Deploy with: ./scripts/deploy.sh"
echo "2. Or deploy manually: vercel --prod"
echo "3. Monitor with: vercel logs"
echo ""
echo "Your Vercel project URL will be shown after deployment."
