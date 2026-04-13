#!/bin/bash
# Deploy or update RegsGuard
set -e

echo "=== Deploying RegsGuard ==="

cd /opt/regsguard

# Pull latest code
git pull origin main

# Build and restart
docker compose up -d --build

# Run migrations
docker compose exec app npx prisma migrate deploy

echo ""
echo "=== Deploy complete! ==="
echo "Check status: docker compose ps"
echo "View logs: docker compose logs -f app"
