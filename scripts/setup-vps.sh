#!/bin/bash
# VPS Setup Script for Debian Contabo
# Run as root on a fresh Debian server

set -e

echo "=== RegsGuard VPS Setup ==="

# Update system
apt update && apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
rm get-docker.sh

# Install Docker Compose
apt install -y docker-compose-plugin

# Install utilities
apt install -y git curl ufw fail2ban

# Configure UFW firewall
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

# Configure fail2ban
cat > /etc/fail2ban/jail.local << 'EOF'
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5

[sshd]
enabled = true
port = ssh
logpath = /var/log/auth.log
EOF

systemctl enable fail2ban
systemctl restart fail2ban

# Create app directory
mkdir -p /opt/regsguard
cd /opt/regsguard

echo ""
echo "=== Setup complete! ==="
echo ""
echo "Next steps:"
echo "1. Clone your repo: git clone <repo-url> /opt/regsguard"
echo "2. Copy env: cp .env.example .env && nano .env"
echo "3. Generate secrets: openssl rand -base64 33"
echo "4. Get SSL cert: certbot certonly --standalone -d yourdomain.com"
echo "5. Start: docker compose up -d --build"
echo "6. Seed database: docker compose exec app npx prisma db seed"
echo "7. Setup backup cron: crontab -e"
echo "   Add: 0 2 * * * /opt/regsguard/scripts/backup.sh"
