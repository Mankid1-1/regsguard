# RegsGuard: Complete Deploy & Launch Guide

## 🚀 Phase 1: Local Verification (5-10 minutes)

### Step 1: Build Locally
```bash
npm run build
```

**Expected**: Builds successfully, no errors.

If errors:
- Check TypeScript: `npm run typecheck`
- Check lint: `npm run lint`

---

### Step 2: Verify Migrations
```bash
npx prisma generate
npx prisma migrate status
```

This shows:
- Current migration status
- Pending migrations (if any)

**If you see pending migrations**: These need to run on production DB

---

### Step 3: Test Critical APIs Locally
```bash
npm run dev
```

Then test in browser:
- `http://localhost:3000/audit` — Free audit tool (should work)
- `http://localhost:3000/api/compliance-audit` — Post test data
- Verify no errors in terminal

---

## 🌐 Phase 2: Push Code to GitHub

### Step 1: Commit Changes
```bash
git add .
git commit -m "Implement viral features: referrals, early-bird pricing, free audit, gamification, email sequences, calendar sync

- Add referral system (Refer 3 → 1 month free)
- Implement early-bird pricing ($19/mo lifetime for first 100)
- Build free compliance audit tool (MN/WI, no signup)
- Add compliance streaks, badges, activity feed
- Create shareable compliance certificates
- Implement weekly digest email with real stats
- Add SMS/WhatsApp share triggers
- Implement Google Calendar sync
- Create contractor-focused email sequences
- Add real testimonials collection (post-signup)
- Update Prisma schema with 8 new tables
- All real data, zero mocks" -m "" -m "Assisted-By: docker-agent"
git push origin main
```

---

## 💾 Phase 3: Supabase Database Setup

### Step 1: Create Supabase Project (if not exists)

Go to: https://supabase.com → Sign in → New project

**Settings**:
- Organization: Your account
- Project name: `regsguard-prod`
- Database password: (generate strong password, save securely)
- Region: Choose closest to your users (US East for MN/WI)

**Wait 2-3 minutes** for project to provision.

---

### Step 2: Get Connection String

In Supabase dashboard:
1. Click project name → Settings
2. Database → Connection strings
3. Copy **URI** (Postgres connection string)

Format: `postgresql://postgres:[PASSWORD]@[HOST]:[PORT]/postgres`

---

### Step 3: Update .env.production (Vercel)

We'll do this in Vercel dashboard next (don't hardcode secrets in code).

---

### Step 4: Run Migrations on Supabase

```bash
# Export your connection string temporarily
export DATABASE_URL="postgresql://postgres:[PASSWORD]@[HOST]:[PORT]/postgres"

# Run migrations
npx prisma migrate deploy

# Verify schema
npx prisma db push
```

**Expected**: 
- "Migrations applied: X"
- No errors

**If migration fails**:
- Check schema syntax: `npx prisma validate`
- Reset (destructive): `npx prisma migrate reset` (dev only)
- Check Supabase status: https://status.supabase.com

---

### Step 5: Verify Tables in Supabase

Supabase dashboard → SQL Editor → Run:
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

**You should see 50+ tables** (including new ones: ComplianceStreak, UserBadge, ActivityFeed, etc.)

---

## 🔧 Phase 4: Vercel Configuration

### Step 1: Connect Repository (if not already)

1. Go to https://vercel.com → Dashboard
2. Click "Add New..." → Project
3. Select your GitHub repository
4. Click "Import"

If already connected → Skip to Step 2.

---

### Step 2: Set Environment Variables

In Vercel dashboard:
1. Click your project → Settings → Environment Variables
2. Add each variable (copy from `.env.example`):

**Database**:
```
DATABASE_URL = postgresql://postgres:[PASSWORD]@[HOST]:[PORT]/postgres
```

**Authentication (Clerk)**:
```
CLERK_SECRET_KEY = sk_live_XXXXXXXXX
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = pk_live_XXXXXXXXX
```

**App URL**:
```
NEXT_PUBLIC_APP_URL = https://regsguard.vercel.app
```

**Payments (Stripe)**:
```
STRIPE_PUBLIC_KEY = pk_live_XXXXXXXXX
STRIPE_SECRET_KEY = sk_live_XXXXXXXXX
STRIPE_WEBHOOK_SECRET = whsec_XXXXXXXXX
```

**Email (Resend)**:
```
RESEND_API_KEY = re_XXXXXXXXX
```

**Optional (SMS)**:
```
TWILIO_ACCOUNT_SID = ACxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN = your_token
TWILIO_PHONE_NUMBER = +1234567890
```

**Optional (Analytics)**:
```
NEXT_PUBLIC_POSTHOG_KEY = phc_XXXXXXXXX
```

**Cron Secret**:
```
CRON_SECRET = generate_random_32_char_string
```

---

### Step 3: Configure Build Settings

In Vercel dashboard → Settings → Build & Development:

- **Framework Preset**: Next.js (should auto-detect)
- **Build Command**: `npm run build` (default)
- **Output Directory**: `.next` (default)

---

### Step 4: Deploy

Option A: **Auto-deploy on push**
- Just push to main → Vercel auto-deploys
- Check: https://vercel.com/your-username/regsguard → Deployments

Option B: **Manual deploy**
```bash
npm i -g vercel
vercel
```

Follow prompts:
- Link to your Vercel account
- Select project name
- Deploy

---

## ✅ Phase 5: Verify Production Deploy

### Step 1: Check Deployment Status

Vercel dashboard → Deployments → Latest should show ✅ (green)

**If red 🔴**:
- Click deployment → Logs
- Check error messages
- Common issues:
  - Missing env variables → Add to Vercel
  - Build fails → Check `npm run build` locally
  - Database not accessible → Check DATABASE_URL format

---

### Step 2: Test Live URLs

Go to: `https://regsguard.vercel.app`

**Test these routes** (all should work):
- `/` — Homepage ✅
- `/audit` — Free compliance audit ✅
- `/login` — Clerk login ✅
- `/api/regulations` — API (no auth, returns regulations) ✅

**Test authenticated routes** (sign up first):
- `/dashboard` — Dashboard ✅
- `/api/user/referral` — Referral stats ✅

---

### Step 3: Check Database Connection

From your local machine:
```bash
# Test with live DATABASE_URL from Vercel
DATABASE_URL="postgresql://postgres:PASSWORD@HOST:PORT/postgres" \
npx prisma studio

# This opens a web UI showing all tables
# Verify tables are populated with migration data
```

---

## 🔐 Phase 6: Configure Critical Services

### Step 1: Clerk Authentication Setup

1. Go to https://clerk.com → Dashboard
2. Click your app → Settings
3. **Authorized redirect URLs**: Add `https://regsguard.vercel.app`
4. **OAuth Providers** (optional): GitHub, Google, etc.
5. Save

---

### Step 2: Stripe Webhook Configuration

1. Go to https://dashboard.stripe.com → Developers → Webhooks
2. Click "Add endpoint"
3. **Endpoint URL**: `https://regsguard.vercel.app/api/webhooks/stripe`
4. **Listen to**: Select:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Click "Add endpoint"
6. Copy **Signing secret** → Add to Vercel as `STRIPE_WEBHOOK_SECRET`

---

### Step 3: Resend Email Configuration

1. Go to https://resend.com → API Keys
2. Copy **API Key** (already in Vercel as `RESEND_API_KEY`)
3. Go to Domains → Add domain
4. Add: `mail.regsguard.vercel.app` or custom domain
5. Verify DNS records
6. Test: `curl -X POST "https://api.resend.com/emails" -H "Authorization: Bearer YOUR_KEY"`

---

### Step 4: Twilio SMS Setup (Optional)

If you want SMS alerts:

1. Go to https://www.twilio.com → Account → Settings
2. Copy **Account SID** and **Auth Token**
3. Go to Phone Numbers → Buy a number
4. Add credentials to Vercel:
   - `TWILIO_ACCOUNT_SID`
   - `TWILIO_AUTH_TOKEN`
   - `TWILIO_PHONE_NUMBER` (the number you just bought)

---

## 📊 Phase 7: Configure Analytics & Monitoring

### Step 1: PostHog Analytics (Optional)

1. Go to https://posthog.com → Sign up
2. Create project
3. Copy **API Key**
4. Add to Vercel: `NEXT_PUBLIC_POSTHOG_KEY`

This tracks:
- Signup funnel (free audit → signup conversion)
- Feature usage
- User retention

---

### Step 2: Sentry Error Tracking (Optional)

1. Go to https://sentry.io → Create project
2. Select Next.js
3. Copy DSN
4. Add to Vercel: `SENTRY_AUTH_TOKEN`

---

## 🎬 Phase 8: Pre-Launch Checklist

### Database
- [ ] Migrations ran on Supabase
- [ ] Tables visible in Supabase dashboard
- [ ] Connection string correct in Vercel

### Code
- [ ] Git push to main completed
- [ ] Vercel build ✅ (green)
- [ ] No errors in Vercel logs

### Integrations
- [ ] Clerk: Live keys in Vercel
- [ ] Stripe: Webhook configured, secret in Vercel
- [ ] Resend: API key in Vercel
- [ ] Twilio: Credentials in Vercel (optional)

### URLs
- [ ] `https://regsguard.vercel.app` loads
- [ ] `/audit` works
- [ ] `/login` goes to Clerk
- [ ] Free audit API responds

### Configuration
- [ ] NEXT_PUBLIC_APP_URL set to `https://regsguard.vercel.app`
- [ ] All env vars in Vercel match `.env.example`
- [ ] No hardcoded secrets in code

---

## 🚀 Phase 9: Launch Day

### Morning (1 hour before launch)

1. **Final verification**:
   ```bash
   # From local machine, test live endpoints
   curl https://regsguard.vercel.app/api/regulations
   curl https://regsguard.vercel.app/api/health
   ```

2. **Monitor Vercel dashboard** (keep open during launch)

3. **Test signup flow** (go through full signup → dashboard)

---

### Launch (Go Live!)

#### Step 1: Announce on Social
- LinkedIn: Post about free audit tool
- Twitter/X: Tweet about launch
- Reddit: Post in relevant contractor communities (r/electricians, etc.)
- Facebook Groups: Local MN/WI contractor groups

**Message template**:
```
🚀 Launching RegsGuard: Compliance autopilot for contractors

Stop losing $500+ to late fees. 

👉 Free audit (60 seconds): https://regsguard.vercel.app/audit

One of the first 100 contractors gets $19/mo for LIFE
(Regular: $29/mo after early-bird slots filled)

Built by [your name], for plumbers, electricians, HVAC pros in MN & WI
```

#### Step 2: Email Campaign (If you have list)
- Existing contractor contacts
- Network

#### Step 3: Monitor Metrics

**Open Vercel Analytics** → Watch real-time:
- Page views
- API usage
- Build status

**Check Supabase**:
- Database connections
- Row counts (growing = users signing up)

**Check Stripe**:
- Subscription creations

---

### Post-Launch (First 48 hours)

1. **Respond to inquiries immediately**
   - Check support email
   - Reply within 1 hour

2. **Monitor errors**:
   - Sentry dashboard for bugs
   - Vercel logs for crashes

3. **Track conversion**:
   - How many audits completed?
   - Audit → signup conversion rate?
   - Any referrals yet?

4. **Fix bugs ASAP**:
   - Fix locally
   - Git push → Auto-deploys to Vercel
   - Monitor that specific fix in logs

---

## 📱 Phase 10: Post-Launch Operations

### Weekly Tasks

1. **Review Testimonials** (admin only)
   - Check database: `SELECT * FROM UserTestimonial WHERE approved = false`
   - Read quotes, verify legitimate
   - Update: `UPDATE UserTestimonial SET approved = true WHERE id = 'X'`
   - Feature top ones: `UPDATE UserTestimonial SET featured = true WHERE id = 'Y'`

2. **Monitor Early-Bird Slots**
   - Query: `SELECT COUNT(*) FROM Subscription WHERE earlyBirdLocked = true`
   - If < 20 slots left → Update homepage with "Only X spots left"

3. **Review Referrals**
   - Check conversions: `SELECT * FROM Referral WHERE status = 'PENDING'`
   - Manually verify (if needed) and mark CONVERTED

4. **Send Weekly Digest**
   - Cron job (schedule in Vercel):
   ```bash
   # Run every Sunday 9am EST
   0 9 * * 0 npm run cron:weekly-digest
   ```

---

### Monthly Tasks

1. **Review Analytics**
   - Signup funnel (audit → trial → paid)
   - Feature usage
   - Retention rate

2. **Update Regulations** (if needed)
   - Admin panel: `/admin/regulations`
   - Add new reqs as states change
   - Update fee amounts

3. **Process Payouts** (if referrals > threshold)
   - Track referral earnings
   - Monthly payout for top referrers

---

## 🆘 Troubleshooting

### "Database connection refused"
```
❌ Solution:
1. Check DATABASE_URL in Vercel is correct
2. Verify Supabase project is running (not paused)
3. Check IP whitelist in Supabase → Settings → Network → IP Whitelist
   - Add: 0.0.0.0/0 (allows Vercel)
```

### "Clerk login not working"
```
❌ Solution:
1. Verify CLERK_SECRET_KEY is correct (sk_live_...)
2. Verify NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is correct (pk_live_...)
3. Check Clerk dashboard → Settings → Authorized redirect URLs
   - Add: https://regsguard.vercel.app
4. Clear browser cache and retry
```

### "Email not sending"
```
❌ Solution:
1. Check RESEND_API_KEY is correct
2. Check Resend dashboard → Domain Status (CNAME records configured?)
3. Try test email: 
   curl -X POST "https://api.resend.com/emails" \
   -H "Authorization: Bearer YOUR_KEY" \
   -H "Content-Type: application/json" \
   -d '{
     "from": "onboarding@resend.dev",
     "to": "your@email.com",
     "subject": "Test",
     "html": "<strong>Hello</strong>"
   }'
```

### "Stripe webhook not triggering"
```
❌ Solution:
1. Check STRIPE_WEBHOOK_SECRET matches Stripe dashboard
2. Go to Stripe → Webhooks → Click endpoint → Logs
   - See if webhook is being sent
3. Check Vercel logs for errors in webhook handler
4. Test manually:
   curl -X POST https://regsguard.vercel.app/api/webhooks/stripe \
   -H "Content-Type: application/json" \
   -d '{...}'
```

### "404 on /audit or other routes"
```
❌ Solution:
1. Verify files exist:
   - src/app/audit/page.tsx
   - src/app/api/compliance-audit/route.ts
2. Check Vercel build logs for TypeScript errors
3. Rebuild locally: npm run build
4. Push to GitHub → Wait for Vercel redeploy (2-3 min)
```

---

## 📝 Quick Reference: Command Line

### Push Code
```bash
git add .
git commit -m "Your message"
git push origin main
# Vercel auto-deploys in 1-2 minutes
```

### View Production Logs
```bash
# Install Vercel CLI
npm i -g vercel

# View logs
vercel logs --prod
```

### Run Migration
```bash
DATABASE_URL="your_supabase_url" npx prisma migrate deploy
```

### Check Database
```bash
DATABASE_URL="your_supabase_url" npx prisma studio
```

---

## ✨ You're Launched!

Once all green ✅:

1. **Tell your network** → Word of mouth > paid ads
2. **Monitor first week** → Fix bugs, respond to users
3. **Iterate fast** → Based on real feedback
4. **Scale what works** → Referrals, free audit, email sequences

---

## 🎯 Success Metrics (Week 1)

| Metric | Goal |
|--------|------|
| Free audits completed | 50+ |
| Signups | 10+ |
| Conversion (audit → signup) | 20%+ |
| Referrals generated | 5+ |
| Testimonials collected | 2+ |
| Daily active users | 5+ |
| Errors in Sentry | 0 |

---

## Need Help?

- **Vercel Docs**: https://vercel.com/docs
- **Supabase Docs**: https://supabase.com/docs
- **Prisma Docs**: https://www.prisma.io/docs
- **Stripe Integration**: https://stripe.com/docs/payments
- **Clerk Auth**: https://clerk.com/docs

**You're ready to launch.** 🚀
