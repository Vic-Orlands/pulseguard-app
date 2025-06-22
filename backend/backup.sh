#!/bin/bash

set -e

CONTAINER_NAME="postgres"
DB_NAME="pulseguard"
DB_USER="postgres"
BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/pg_backup_$DATE.sql"

mkdir -p "$BACKUP_DIR"

docker exec -t "$CONTAINER_NAME" pg_dump -U "$DB_USER" "$DB_NAME" > "$BACKUP_FILE"

echo "✅ Backup complete: $BACKUP_FILE"
