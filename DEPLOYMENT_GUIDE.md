# RegsGuard Production Deployment Guide

## Overview
This guide will help you deploy RegsGuard to Vercel and update your Supabase database with all the new features and enhancements.

## Prerequisites
- Vercel account
- Supabase project
- Node.js 18+
- Git repository

## Step 1: Update Supabase Database

### 1.1 Run Database Migrations
```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run all migrations
npx prisma migrate deploy

# Seed the database (if needed)
npm run seed
```

### 1.2 Update Environment Variables in Supabase
Add these to your Supabase Edge Functions or Database secrets:

```bash
# Database
DATABASE_URL="postgresql://username:password@host:port/database"

# Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="your_clerk_publishable_key"
CLERK_SECRET_KEY="your_clerk_secret_key"

# Email Services
RESEND_API_KEY="your_resend_api_key"
SMTP_HOST="your_smtp_host"
SMTP_PORT="587"
SMTP_USER="your_smtp_username"
SMTP_PASS="your_smtp_password"

# Payment Processing
STRIPE_SECRET_KEY="your_stripe_secret_key"
STRIPE_PUBLISHABLE_KEY="your_stripe_publishable_key"
STRIPE_WEBHOOK_SECRET="your_stripe_webhook_secret"

# License Verification APIs
MINNESOTA_DLI_API_KEY="your_mn_dli_key"
MINNESOTA_ELECTRICAL_API_KEY="your_mn_electrical_key"
MINNESOTA_PLUMBING_API_KEY="your_mn_plumbing_key"
MINNESOTA_HVAC_API_KEY="your_mn_hvac_key"
WISCONSIN_DSPS_API_KEY="your_wi_dsps_key"
WISCONSIN_ELECTRICAL_API_KEY="your_wi_electrical_key"
WISCONSIN_PLUMBING_API_KEY="your_wi_plumbing_key"
WISCONSIN_HVAC_API_KEY="your_wi_hvac_key"

# Cron Job Security
CRON_SECRET="your_cron_secret_key"

# Application
NEXT_PUBLIC_APP_URL="https://your-domain.vercel.app"
NODE_ENV="production"

# Monitoring (Optional)
SENTRY_DSN="your_sentry_dsn"
```

## Step 2: Configure Vercel

### 2.1 Create Vercel Project
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Link your project
vercel link
```

### 2.2 Update Vercel Configuration
Create/Update `vercel.json`:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  },
  "build": {
    "env": {
      "PRISMA_GENERATE_DATAPROXY": "1"
    }
  },
  "functions": {
    "src/app/api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "crons": [
    {
      "path": "/api/cron/deadline-check",
      "schedule": "0 2 * * *"
    },
    {
      "path": "/api/cron/cleanup",
      "schedule": "0 3 * * 0"
    }
  ]
}
```

### 2.3 Set Environment Variables in Vercel
```bash
# Set production environment variables
vercel env add DATABASE_URL production
vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY production
vercel env add CLERK_SECRET_KEY production
vercel env add RESEND_API_KEY production
vercel env add STRIPE_SECRET_KEY production
vercel env add STRIPE_PUBLISHABLE_KEY production
vercel env add CRON_SECRET production
vercel env add NEXT_PUBLIC_APP_URL production
```

## Step 3: Update Package.json Scripts

Make sure your `package.json` has these scripts:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "db:generate": "prisma generate",
    "db:push": "prisma db push",
    "db:migrate": "prisma migrate dev",
    "db:deploy": "prisma migrate deploy",
    "db:seed": "tsx prisma/seed.ts",
    "postinstall": "prisma generate"
  }
}
```

## Step 4: Deploy to Vercel

### 4.1 Build and Deploy
```bash
# Build the application
npm run build

# Deploy to Vercel
vercel --prod
```

### 4.2 Verify Deployment
- Check that the site loads correctly
- Test authentication flows
- Verify database connections
- Test auto-renewal functionality

## Step 5: Post-Deployment Setup

### 5.1 Configure Cron Jobs
Vercel will automatically set up the cron jobs from your `vercel.json`. Verify they're working:

```bash
# Test cron endpoint
curl https://your-domain.vercel.app/api/cron/deadline-check \
  -H "Authorization: Bearer your_cron_secret"
```

### 5.2 Set Up Monitoring
```bash
# Check Vercel logs
vercel logs

# Monitor health endpoint
curl https://your-domain.vercel.app/api/health
```

### 5.3 Test Key Features
1. **User Registration**: Create a test account
2. **Smart Onboarding**: Complete the onboarding flow
3. **Auto-Renewal**: Set up auto-renewal for a license
4. **Intelligent Insights**: Check the dashboard
5. **PDF Generation**: Generate compliance documents

## Step 6: Troubleshooting

### Common Issues and Solutions

#### Database Connection Issues
```bash
# Check DATABASE_URL format
echo $DATABASE_URL

# Test connection
npx prisma db pull
```

#### Build Errors
```bash
# Clear cache
rm -rf .next
npm run build

# Regenerate Prisma client
npx prisma generate
```

#### Cron Job Issues
```bash
# Check cron logs
vercel logs --filter=cron

# Test manually
curl -X POST https://your-domain.vercel.app/api/cron/deadline-check \
  -H "Authorization: Bearer $CRON_SECRET"
```

#### Environment Variable Issues
```bash
# List all env vars
vercel env ls

# Pull env vars locally
vercel env pull .env.production
```

## Step 7: Performance Optimization

### 7.1 Enable Vercel Analytics
```bash
vercel analytics enable
```

### 7.2 Configure Caching
Update your `next.config.ts`:

```typescript
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: true,
  },
  images: {
    domains: ['your-domain.vercel.app'],
  },
  async rewrites() {
    return [
      {
        source: '/api/health',
        destination: '/api/health',
      },
    ];
  },
};

module.exports = nextConfig;
```

## Step 8: Security Checklist

- [ ] All environment variables are set
- [ ] Database connection is secure (SSL enabled)
- [ ] CORS is properly configured
- [ ] Rate limiting is enabled
- [ ] CSRF protection is active
- [ ] Input validation is working
- [ ] Error logging is configured
- [ ] Cron jobs are secured

## Step 9: Backup and Recovery

### 9.1 Database Backup
```bash
# Create backup
pg_dump $DATABASE_URL > backup.sql

# Restore backup
psql $DATABASE_URL < backup.sql
```

### 9.2 Application Backup
```bash
# Export code
git archive HEAD > regsguard-backup.tar.gz

# Export environment variables
vercel env ls > env-backup.txt
```

## Step 10: Monitoring and Maintenance

### 10.1 Set Up Alerts
- Vercel project alerts
- Database performance alerts
- Error rate monitoring
- Cron job success/failure alerts

### 10.2 Regular Maintenance
- Weekly: Check logs and performance
- Monthly: Update dependencies
- Quarterly: Review and optimize database
- Annually: Security audit and updates

## Emergency Procedures

### If Site Goes Down
1. Check Vercel status
2. Review recent deployments
3. Check database connectivity
4. Verify environment variables
5. Roll back if necessary

### Database Issues
1. Check Supabase status
2. Verify connection string
3. Run health checks
4. Restore from backup if needed

### Performance Issues
1. Check Vercel analytics
2. Review database queries
3. Optimize slow endpoints
4. Scale resources if needed

## Support Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
- [Prisma Deployment](https://www.prisma.io/docs/concepts/deployment)

## Next Steps

After successful deployment:
1. Set up custom domain
2. Configure SSL certificates
3. Set up monitoring dashboards
4. Train team on new features
5. Document custom configurations
6. Plan for scaling

---

**Note**: This deployment includes all the enhanced features:
- Intelligent auto-renewal system
- Built-in predictive analytics
- Enhanced security measures
- Performance optimization
- Comprehensive monitoring

The system is designed to be self-sufficient and requires no external AI services or additional subscriptions.
