# RegsGuard Launch Checklist (Copy & Print)

## 🔧 Local Prep (30 minutes)

- [ ] Run `npm run build` (no errors)
- [ ] Run `npm run lint` (no errors)
- [ ] Test `/audit` endpoint locally
- [ ] Verify migrations: `npx prisma migrate status`
- [ ] Commit code: `git add . && git commit -m "Launch: viral features complete"`
- [ ] Push to GitHub: `git push origin main`

---

## 💾 Supabase Setup (15 minutes)

- [ ] Create project at supabase.com
- [ ] Wait for provisioning (2-3 min)
- [ ] Copy connection string (URI format)
- [ ] Save password securely
- [ ] Run migrations: `npx prisma migrate deploy`
- [ ] Verify tables created: 50+ tables in dashboard
- [ ] Test SQL query in Supabase editor

---

## 🌐 Vercel Configuration (20 minutes)

- [ ] Import GitHub repo to Vercel (or connect if existing)
- [ ] Wait for first build
- [ ] Set all env variables in Settings → Environment Variables:
  - [ ] `DATABASE_URL` (Supabase)
  - [ ] `CLERK_SECRET_KEY` (sk_live_...)
  - [ ] `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (pk_live_...)
  - [ ] `NEXT_PUBLIC_APP_URL` = https://regsguard.vercel.app
  - [ ] `STRIPE_PUBLIC_KEY` (pk_live_...)
  - [ ] `STRIPE_SECRET_KEY` (sk_live_...)
  - [ ] `STRIPE_WEBHOOK_SECRET` (whsec_...)
  - [ ] `RESEND_API_KEY` (re_...)
  - [ ] `TWILIO_ACCOUNT_SID` (optional)
  - [ ] `TWILIO_AUTH_TOKEN` (optional)
  - [ ] `TWILIO_PHONE_NUMBER` (optional)
- [ ] Verify build succeeds (green ✅)
- [ ] Test homepage loads: https://regsguard.vercel.app

---

## 🔐 Integration Setup (30 minutes)

### Clerk
- [ ] Copy live credentials from clerk.com
- [ ] Add to Vercel env vars
- [ ] Set authorized redirect URL: https://regsguard.vercel.app
- [ ] Test login flow

### Stripe
- [ ] Copy live API keys from Stripe dashboard
- [ ] Add to Vercel env vars
- [ ] Configure webhook endpoint:
  - [ ] URL: https://regsguard.vercel.app/api/webhooks/stripe
  - [ ] Events: subscription.created, subscription.updated, subscription.deleted
- [ ] Copy webhook secret, add to Vercel
- [ ] Test webhook (Stripe dashboard → Webhooks → Send test event)

### Resend
- [ ] Copy API key from resend.com
- [ ] Add to Vercel as `RESEND_API_KEY`
- [ ] Add domain (optional, for custom sender)
- [ ] Test email send: `curl -X POST https://api.resend.com/emails...`

### Twilio (Optional - SMS)
- [ ] Get Account SID & Auth Token from twilio.com
- [ ] Buy phone number
- [ ] Add to Vercel env vars
- [ ] Test SMS send

---

## ✅ Pre-Launch Testing (20 minutes)

### Database
- [ ] Run: `DATABASE_URL="..." npx prisma studio`
- [ ] Verify tables exist and are empty
- [ ] Close Prisma Studio

### Homepage & Routes
- [ ] [ ] https://regsguard.vercel.app → Loads, no errors
- [ ] [ ] https://regsguard.vercel.app/audit → Loads, form works
- [ ] [ ] https://regsguard.vercel.app/login → Clerk login shows
- [ ] [ ] https://regsguard.vercel.app/api/regulations → Returns JSON

### Signup Flow
- [ ] Create test account (via Clerk)
- [ ] Complete onboarding
- [ ] Reach dashboard
- [ ] No errors in Vercel logs

### Free Audit Tool
- [ ] Go to /audit
- [ ] Fill form (MN, PLUMBING, license number)
- [ ] Submit
- [ ] Get audit result (score + recommendations)
- [ ] Check database: `SELECT * FROM ComplianceAudit LIMIT 1;`

---

## 🚀 Launch Day (1 hour)

### 30 min before:
- [ ] Final `git push` if any last changes
- [ ] Vercel build ✅
- [ ] All env vars set
- [ ] Test one signup flow end-to-end
- [ ] Open Vercel dashboard (keep monitoring)

### Launch time:
- [ ] Announce on LinkedIn
- [ ] Announce on Twitter
- [ ] Post in Reddit contractor communities
- [ ] Post in Facebook groups (MN/WI contractors)
- [ ] Email network (if any contacts)
- [ ] Monitor Vercel logs for errors

### First 2 hours:
- [ ] Watch Vercel analytics (page views growing?)
- [ ] Check Supabase (users table growing?)
- [ ] Respond to any inquiries immediately
- [ ] Monitor Sentry for errors

---

## 📊 First Week Monitoring

- [ ] Check free audits completed (Supabase: `SELECT COUNT(*) FROM ComplianceAudit;`)
- [ ] Check signups (Supabase: `SELECT COUNT(*) FROM User WHERE createdAt > 'today';`)
- [ ] Calculate conversion (audits → signups)
- [ ] Monitor daily active users
- [ ] Review any bugs in Sentry
- [ ] Fix critical bugs within 1 hour
- [ ] Respond to all support emails within 2 hours

---

## 🎯 First Month Milestones

- [ ] 100+ free audits completed
- [ ] 20+ signups
- [ ] 20%+ conversion rate (audit → signup)
- [ ] 5+ referrals generated
- [ ] 5+ testimonials collected
- [ ] 0 critical bugs

---

## 🆘 If Something Breaks

### Build fails (🔴 on Vercel)
1. Check build logs: Click deployment → Logs
2. Fix locally: `npm run build`
3. Check TypeScript: `npm run typecheck`
4. Git push → Vercel redeploys

### Database connection error
1. Check DATABASE_URL in Vercel (correct format?)
2. Check Supabase is running (not paused)
3. Check IP whitelist in Supabase (add 0.0.0.0/0)

### Login not working
1. Check CLERK_SECRET_KEY is correct
2. Check authorized redirect URLs in Clerk
3. Clear browser cache, try again

### Email not sending
1. Check RESEND_API_KEY is correct
2. Check Resend domain configuration
3. Test manually with curl

### Stripe webhook not firing
1. Check webhook secret in Vercel
2. Check endpoint URL in Stripe
3. Check Stripe logs for errors

---

## 📝 Quick Commands

```bash
# Push changes to GitHub (triggers Vercel deploy)
git add .
git commit -m "Your message"
git push origin main

# View production logs
vercel logs --prod

# Run migrations on Supabase
DATABASE_URL="your_url" npx prisma migrate deploy

# Open Prisma Studio (view/edit database)
DATABASE_URL="your_url" npx prisma studio

# Check build locally
npm run build

# Check types
npm run typecheck

# Check lint
npm run lint
```

---

## 🎉 You're Live!

✅ Site deployed: https://regsguard.vercel.app
✅ Database: Supabase (prod)
✅ Auth: Clerk (live)
✅ Payments: Stripe (live)
✅ Email: Resend (live)

**Now go acquire contractors.** 🚀

---

## Support Contacts

- **Vercel**: vercel.com/support
- **Supabase**: supabase.com/docs or Discord
- **Stripe**: stripe.com/support
- **Clerk**: clerk.com/support
- **Resend**: resend.com/docs

**Time to launch: ~2 hours total**
