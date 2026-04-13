#!/bin/bash
# Daily PostgreSQL backup script
# Run via cron: 0 2 * * * /opt/regsguard/scripts/backup.sh

set -e

BACKUP_DIR="/opt/regsguard/scripts/backups"
DB_CONTAINER="regsguard_db"
DB_USER="${DB_USER:-regsguard}"
DB_NAME="${DB_NAME:-regsguard}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=30

mkdir -p "$BACKUP_DIR"

echo "[$(date)] Starting backup..."

docker exec "$DB_CONTAINER" pg_dump -U "$DB_USER" "$DB_NAME" | gzip > "$BACKUP_DIR/backup_${TIMESTAMP}.sql.gz"

chmod 600 "$BACKUP_DIR/backup_${TIMESTAMP}.sql.gz"

# Remove backups older than retention period
find "$BACKUP_DIR" -name "backup_*.sql.gz" -mtime +$RETENTION_DAYS -delete

echo "[$(date)] Backup completed: backup_${TIMESTAMP}.sql.gz"
echo "[$(date)] Backup completed" >> "$BACKUP_DIR/backup.log"
