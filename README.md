# RegsGuard

Trade compliance tracking SaaS for plumbers, electricians, and HVAC professionals. Installable PWA with offline support.

## Features

- **One-time setup**: Enter business info once, auto-fills every form forever
- **Deadline tracking**: Color-coded 90-day view (red/yellow/green)
- **One-click PDF**: Generate pre-filled compliance documents
- **Auto-send**: Email PDFs directly to government authorities
- **Smart alerts**: Email reminders at 60/30/14/7/1 days before deadlines
- **PWA**: Install on iOS/Android, works offline
- **Admin panel**: Add/edit regulations when laws change

## Tech Stack

- Next.js 15 (App Router) + Tailwind CSS + TypeScript
- PostgreSQL + Prisma ORM
- NextAuth v5 (email/password)
- Puppeteer (PDF generation)
- Resend + Nodemailer (email)
- Stripe (subscriptions)
- Docker Compose (deployment)

## Local Development

```bash
# 1. Start PostgreSQL
docker compose -f docker-compose.dev.yml up -d

# 2. Install dependencies
npm install

# 3. Setup environment
cp .env.example .env
# Edit .env with your values

# 4. Run migrations and seed
npx prisma migrate dev
npx prisma db seed

# 5. Start dev server
npm run dev
```

## VPS Deployment (Debian Contabo)

```bash
# 1. Run VPS setup
sudo bash scripts/setup-vps.sh

# 2. Clone and configure
git clone <your-repo> /opt/regsguard
cd /opt/regsguard
cp .env.example .env
nano .env  # Fill in production values

# 3. Generate secrets
openssl rand -base64 33  # For NEXTAUTH_SECRET

# 4. SSL certificate
sudo certbot certonly --standalone -d yourdomain.com

# 5. Deploy
docker compose up -d --build

# 6. Seed database
docker compose exec app npx prisma db seed

# 7. Setup daily backup cron
crontab -e
# Add: 0 2 * * * /opt/regsguard/scripts/backup.sh
```

## Updating Regulations

1. Go to `/admin/regulations` (requires ADMIN role)
2. Click "Add Regulation" or edit existing ones
3. Changes take effect immediately for all users

To set a user as admin:
```sql
UPDATE "User" SET role = 'ADMIN' WHERE email = 'your@email.com';
```

## PWA Testing

**Android (Chrome):**
- Visit the site in Chrome
- Tap the install prompt or Menu > "Add to Home Screen"

**iOS (Safari):**
- Visit the site in Safari
- Tap Share > "Add to Home Screen"

**Lighthouse:**
```bash
npx lighthouse https://yourdomain.com --preset=desktop
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| DATABASE_URL | Yes | PostgreSQL connection string |
| NEXTAUTH_SECRET | Yes | Random 33+ char secret |
| NEXTAUTH_URL | Yes | Full app URL |
| STRIPE_SECRET_KEY | No | Stripe API key |
| STRIPE_WEBHOOK_SECRET | No | Stripe webhook signing secret |
| STRIPE_PRICE_MONTHLY | No | Stripe price ID for $29/mo |
| STRIPE_PRICE_ANNUAL | No | Stripe price ID for $290/yr |
| RESEND_API_KEY | No | Resend email API key |
| CRON_SECRET | No | Secret for manual cron trigger |
