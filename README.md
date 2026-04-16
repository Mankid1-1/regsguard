# RegsGuard

Trade compliance automation for plumbers, electricians, and HVAC professionals in Minnesota and Wisconsin. Tracks licenses, permits, CE requirements, and automatically generates compliance documents. Web/PWA-first product with offline support.

## Features

- **One-time setup**: Enter business info once, auto-fills every form forever
- **Deadline tracking**: Color-coded 90-day calendar view (red/yellow/green)
- **One-click PDF**: Generate pre-filled compliance documents
- **Auto-send**: Email PDFs directly to government authorities
- **Smart alerts**: Email reminders at 60/30/14/7/1 days before deadlines
- **PWA-first**: Install on your phone like a native app, works offline
- **Team management**: Add field workers, bookkeepers, and managers with role-based access
- **Admin panel**: Add/edit regulations when laws change

## Supported Trades & States

RegsGuard currently supports:

- **Minnesota (MN)**: Plumbing, Electrical, HVAC, General Contracting
- **Wisconsin (WI)**: Plumbing, Electrical, HVAC, General Contracting
- **EPA/Lead-Safe**: Lead Renovator Certification, lead abatement

Verification features (license, insurance, bond checks) run in simulated mode unless your state's verification provider is configured. All simulated verifications are clearly labeled as such in the UI.

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, Tailwind CSS 4, TypeScript
- **Backend**: Node.js, Next.js API Routes, Puppeteer (PDF generation)
- **Database**: PostgreSQL 15+ with Prisma ORM
- **Auth**: Clerk (email + OAuth)
- **Email**: Resend (primary) + Nodemailer (fallback)
- **Payments**: Stripe (subscriptions)
- **Deployment**: Vercel (canonical host: https://regsguard.vercel.app)
- **Monitoring**: Sentry (optional)

## Local Development

### 1. Prerequisites
- Node.js 18+
- PostgreSQL 15+
- Docker + Docker Compose (optional, for PostgreSQL)

### 2. Clone & Setup

```bash
git clone <your-repo>
cd regsguard
npm install
```

### 3. Environment

```bash
cp .env.example .env
# Edit .env with your local/development values
```

**Key environment variables:**
- `DATABASE_URL`: PostgreSQL connection string
- `CLERK_SECRET_KEY`: Your Clerk secret key
- `NEXT_PUBLIC_APP_URL`: App URL (http://localhost:3000 for dev)
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, etc. (for billing)
- `RESEND_API_KEY` (for email)

### 4. Database Setup

```bash
# Using Docker Compose (includes PostgreSQL)
docker compose -f docker-compose.dev.yml up -d

# Generate Prisma client
npm run build

# Run migrations
npx prisma migrate dev

# Seed with sample data
npx prisma db seed
```

### 5. Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Updating Regulations

1. **Admin panel**: Go to `/admin/regulations` (requires ADMIN or OWNER role)
2. **Add Regulation**: Click "Add Regulation" and fill in the form
3. **Changes take effect immediately** for all users

To grant admin access:

```sql
UPDATE "User" SET role = 'ADMIN' WHERE email = 'your@email.com';
```

## PWA Installation

**Android (Chrome)**:
- Visit the site in Chrome
- Tap the install prompt (or Menu → "Add to Home Screen")

**iOS (Safari)**:
- Visit the site in Safari
- Tap Share → "Add to Home Screen"

**Verify PWA readiness**:
```bash
npx lighthouse https://yourdomain.com --preset=desktop
```

## Vercel Deployment

RegsGuard is optimized for Vercel. The production canonical URL is `https://regsguard.vercel.app` unless a custom domain is configured.

### Deploy

1. Push to your GitHub repository
2. Connect your repo to Vercel
3. Set environment variables in Vercel dashboard (from `.env.example`)
4. Vercel auto-deploys on main branch

### First Deploy Checklist

- [ ] All critical environment variables set (Stripe, Resend, Clerk, Database)
- [ ] Database migrations run: `npx prisma migrate deploy`
- [ ] Seed data loaded (if needed): `npx prisma db seed`
- [ ] Admin user created in Clerk dashboard
- [ ] Stripe webhooks configured (point to your Vercel domain)
- [ ] Sendgrid/Resend email templates updated with correct URLs

## Stripe Webhook Setup (Vercel)

1. In Stripe Dashboard, go to **Developers → Webhooks**
2. **Add Endpoint**: `https://regsguard.vercel.app/api/webhooks/stripe`
3. **Listen to**: 
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. Copy signing secret → set `STRIPE_WEBHOOK_SECRET` in Vercel

## Clerk Auth Setup

1. Create a Clerk app at [clerk.com](https://clerk.com)
2. Copy **Secret Key** → set `CLERK_SECRET_KEY` in Vercel
3. Add Vercel domain to Allowed Redirect URLs in Clerk dashboard
4. (Optional) Configure OAuth providers (Google, GitHub)

## API Reference

### Public Endpoints (No Auth)

- `GET /api/regulations?trades=PLUMBING,HVAC&states=MN,WI` — Fetch available regulations

### Protected Endpoints (Auth Required)

**Regulations** (Admin/Owner only)
- `POST /api/regulations` — Create a new regulation

**Documents**
- `GET /api/documents?category=TAX` — List user's documents
- `POST /api/documents` — Create document from template
- `GET /api/uploads?documentId=...` — List file uploads
- `POST /api/uploads` — Upload file (PDF, PNG, JPG, HEIC)

**Projects**
- `GET /api/projects` — List user's projects
- `POST /api/projects` — Create project
- `PATCH /api/projects` — Update project
- `DELETE /api/projects?id=...` — Delete project

**Verification** (May return simulated results)
- `POST /api/license-verification` — Verify contractor license
- `POST /api/verify` — Verify insurance/bond (if configured)

**User**
- `GET /api/user` — Get authenticated user profile
- `PATCH /api/user` — Update profile

## Verification Modes

All verification endpoints return a `mode` field:
- `"live"` — Real API integration is configured and active
- `"simulated"` — Provider not configured; results are mock/test data

In the UI, simulated results are clearly labeled. Always verify critical compliance data with actual provider.

## Testing

```bash
# Run unit tests
npm run test

# Watch mode
npm run test:watch

# E2E tests (Playwright)
npx playwright test
```

## Troubleshooting

### Database Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```
→ Ensure PostgreSQL is running: `docker compose -f docker-compose.dev.yml up -d`

### Clerk Auth Error
→ Check `CLERK_SECRET_KEY` is set in `.env`

### Email Not Sending
→ Check `RESEND_API_KEY` or SMTP credentials in `.env`
→ Check email logs in Resend dashboard

### Verification Always Returns "Simulated"
→ Configure the provider API key for your state (e.g., `LICENSE_API_KEY_MN`)

## Reporting Issues

- **Bugs**: Create an issue on GitHub
- **Security**: Email security@regsguard.com (keep out of issues)
- **Questions**: Start a discussion

## License

Proprietary — RegsGuard is closed-source software.

## Support

- **Email**: support@regsguard.com
- **Status**: [status.regsguard.com](https://status.regsguard.com) (when available)
