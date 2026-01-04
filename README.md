# Set up gg calendar
1. Go to https://console.cloud.google.com
2. Create a new project or select an existing one
3. Enable the Google Calendar API
4. Go to "Credentials" > "Create Credentials" > "Service Account"
5. Fill in the service account details
6. Click "Done"
7. Click on the created service account
8. Go to "Keys" tab
9. Click "Add Key" > "Create new key" > "JSON"
10. Download the JSON file and save it as `server/config/google-service-account.json`
11. Share your Google Calendar with the service account email (found in the JSON file)
12. Copy your Calendar ID from Google Calendar settings
13. Add GOOGLE_CALENDAR_ID to your .env file

# Restore data
Example:  bash scripts/restore.sh backups/rental-20251220-131708.db

# Quick start
bash scripts/setup-linux.sh
or
bash scripts/setup-mac.sh