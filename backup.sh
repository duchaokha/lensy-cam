#!/bin/bash

# Camera Rental Database Backup Script

# Create backups directory
mkdir -p backups

# Generate timestamp
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
DATE=$(date +%Y-%m-%d)

# Backup filename
BACKUP_FILE="backups/rental-${TIMESTAMP}.db"

# Check if database exists
if [ -f "database/rental.db" ]; then
    # Copy database
    cp database/rental.db "${BACKUP_FILE}"
    echo "✅ Backup created: ${BACKUP_FILE}"
    
    # Get file size
    SIZE=$(du -h "${BACKUP_FILE}" | cut -f1)
    echo "   Size: ${SIZE}"
    
    # Keep only last 30 backups
    echo "🧹 Cleaning old backups..."
    ls -t backups/rental-*.db 2>/dev/null | tail -n +31 | xargs rm -f 2>/dev/null
    
    # Count remaining backups
    COUNT=$(ls -1 backups/rental-*.db 2>/dev/null | wc -l)
    echo "   Total backups: ${COUNT}"
    
else
    echo "❌ Error: Database file not found at database/rental.db"
    exit 1
fi
