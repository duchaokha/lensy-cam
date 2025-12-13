#!/bin/bash

# Camera Rental Database Restore Script

# Check if backup file is provided
if [ -z "$1" ]; then
    echo "Usage: ./restore.sh <backup-file>"
    echo ""
    echo "Available backups:"
    ls -lh backups/rental-*.db 2>/dev/null | awk '{print "  " $9 " (" $5 ")"}'
    exit 1
fi

BACKUP_FILE=$1

# Check if backup file exists
if [ ! -f "${BACKUP_FILE}" ]; then
    echo "❌ Error: Backup file not found: ${BACKUP_FILE}"
    exit 1
fi

# Confirm restore
echo "⚠️  WARNING: This will replace the current database!"
echo "   Backup file: ${BACKUP_FILE}"
echo ""
read -p "Continue? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo "Restore cancelled."
    exit 0
fi

# Stop Docker container if running
echo "🛑 Stopping application..."
docker compose down 2>/dev/null || true

# Wait for container to fully stop
sleep 2

# Backup current database before restore
if [ -f "database/rental.db" ]; then
    SAFETY_BACKUP="database/rental.db.before-restore-$(date +%Y%m%d-%H%M%S)"
    cp database/rental.db "${SAFETY_BACKUP}" 2>/dev/null || sudo cp database/rental.db "${SAFETY_BACKUP}"
    echo "   Current database backed up to: ${SAFETY_BACKUP}"
fi

# Restore database (with sudo if needed)
if cp "${BACKUP_FILE}" database/rental.db 2>/dev/null; then
    echo "✅ Database restored from: ${BACKUP_FILE}"
else
    echo "   Trying with elevated permissions..."
    sudo cp "${BACKUP_FILE}" database/rental.db
    sudo chown $(id -u):$(id -g) database/rental.db
    echo "✅ Database restored from: ${BACKUP_FILE}"
fi

# Restart Docker container
echo "🚀 Starting application..."
docker compose up -d

echo "✅ Restore complete!"
