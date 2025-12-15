# Google Calendar Integration Setup Guide

This guide will help you set up Google Calendar integration for LensyCam.

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Click "Create Project" or select an existing project
3. Give your project a name (e.g., "LensyCam Calendar")
4. Click "Create"

## Step 2: Enable Google Calendar API

1. In your project, go to "APIs & Services" > "Library"
2. Search for "Google Calendar API"
3. Click on it and press "Enable"

## Step 3: Create Service Account

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "Service Account"
3. Fill in the details:
   - Service account name: `lensycam-calendar`
   - Service account ID: `lensycam-calendar` (auto-filled)
   - Description: "Service account for LensyCam calendar integration"
4. Click "Create and Continue"
5. Skip the optional steps (roles) and click "Done"

## Step 4: Create Service Account Key

1. Click on the service account you just created
2. Go to the "Keys" tab
3. Click "Add Key" > "Create new key"
4. Choose "JSON" format
5. Click "Create"
6. The JSON file will download automatically
7. **Rename** it to `google-service-account.json`
8. **Move** it to: `server/config/google-service-account.json`

## Step 5: Share Your Calendar

1. Open [Google Calendar](https://calendar.google.com)
2. Create a new calendar or use an existing one:
   - Click the "+" next to "Other calendars"
   - Select "Create new calendar"
   - Name it "LensyCam Rentals"
   - Click "Create calendar"
3. Find the calendar in the **left sidebar** under "My calendars"
4. **Hover over the calendar name** and click the **three vertical dots (⋮)** that appear
5. Click **"Settings and sharing"** from the menu
6. In the settings page, scroll down to find **"Share with specific people or groups"** section
7. Click **"Add people and groups"** button
8. **Enter the service account email** (found in your JSON file as `client_email`)
   - Example: `lensycam-calendar@your-project.iam.gserviceaccount.com`
9. In the permissions dropdown, select **"Make changes to events"**
10. Click **"Send"**

**Alternative method if you can't find the three dots:**
1. Go to [Google Calendar Settings](https://calendar.google.com/calendar/u/0/r/settings)
2. Look for your calendar in the left sidebar under "Settings for my calendars"
3. Click on your calendar name (e.g., "LensyCam Rentals")
4. Scroll down to "Share with specific people or groups"
5. Continue from step 7 above

## Step 6: Get Calendar ID

1. Still in calendar settings, scroll down to "Integrate calendar"
2. Copy the "Calendar ID"
   - It looks like: `abc123@group.calendar.google.com`

## Step 7: Configure LensyCam

1. Open your `.env` file in the project root
2. Add these lines:
   ```
   GOOGLE_CALENDAR_ID=your-calendar-id@group.calendar.google.com
   ```
3. Replace `your-calendar-id@group.calendar.google.com` with your actual Calendar ID

## Step 8: Restart the Application

```bash
docker compose down
docker compose build
docker compose up -d
```

## Step 9: Test

1. Create a new rental in LensyCam
2. Check your Google Calendar - you should see a new event!

## Troubleshooting

### Events not appearing?

1. Check the server logs:
   ```bash
   docker logs lensy-cam-app
   ```

2. Verify the service account JSON file is in the correct location:
   ```bash
   ls -la server/config/google-service-account.json
   ```

3. Make sure the Calendar ID in `.env` is correct

4. Verify the service account email has access to the calendar

### Calendar integration disabled?

If you see "Google Calendar: Service account key not found" in logs, the feature will be disabled but the app will continue working normally without calendar integration.

## Security Notes

- ⚠️ Never commit `google-service-account.json` to git
- ⚠️ Keep your service account credentials secure
- ⚠️ Only share your calendar with the specific service account email
- ✅ The JSON file is already in `.gitignore`

## Event Details

When a rental is created, the calendar event will include:
- 📷 Camera name and customer name in the title
- Customer contact info (phone, email)
- Camera details (brand, model)
- Rental type (daily/hourly)
- Total amount and deposit
- Notes (if any)
- Automatic reminder 1 hour before start time

Enjoy your automated calendar! 🎉
