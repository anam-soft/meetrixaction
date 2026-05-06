# Google Calendar OAuth Integration - Complete Setup Guide

This guide provides step-by-step instructions for implementing and configuring the Google Calendar OAuth integration in MeetRix Action.

## 📋 Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Google Cloud Console Setup](#google-cloud-console-setup)
4. [Environment Configuration](#environment-configuration)
5. [Database Setup](#database-setup)
6. [Testing the Integration](#testing-the-integration)
7. [Usage Examples](#usage-examples)
8. [Troubleshooting](#troubleshooting)
9. [API Reference](#api-reference)

---

## Overview

The Google Calendar integration allows users to:
- Connect their Google Calendar account via OAuth 2.0
- Automatically attach meeting tasks to calendar events
- Sync task deadlines with calendar
- View which Google account is connected

### Tech Stack
- **Next.js 14** (App Router)
- **Prisma** (PostgreSQL)
- **googleapis** npm package
- **NextAuth.js** for session management

---

## Prerequisites

Before starting, ensure you have:
- ✅ A Google Cloud Platform account
- ✅ Node.js 18+ installed
- ✅ PostgreSQL database running
- ✅ MeetRix Action project set up

---

## Google Cloud Console Setup

### Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Click **Select a project** → **New Project**
3. Enter project name: `MeetRix Action`
4. Click **Create**

### Step 2: Enable Google Calendar API

1. In your project, go to **APIs & Services** → **Library**
2. Search for "Google Calendar API"
3. Click on it and press **Enable**

### Step 3: Configure OAuth Consent Screen

1. Go to **APIs & Services** → **OAuth consent screen**
2. Choose **External** (unless you have a Google Workspace)
3. Click **Create**

4. Fill in the required fields:
   - **App name**: `MeetRix Action`
   - **User support email**: Your email
   - **Developer contact information**: Your email
5. Click **Save and Continue**

6. **Scopes** page:
   - Click **Add or Remove Scopes**
   - Add these scopes:
     - `https://www.googleapis.com/auth/calendar.readonly`
     - `https://www.googleapis.com/auth/calendar.events`
   - Click **Update** → **Save and Continue**

7. **Test users** page (for development):
   - Click **Add Users**
   - Add your test email addresses
   - Click **Save and Continue**

8. Review and click **Back to Dashboard**

### Step 4: Create OAuth 2.0 Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth client ID**
3. Choose **Application type**: `Web application`
4. **Name**: `MeetRix Action Web Client`

5. **Authorized redirect URIs** - Add both:
   - Development: `http://localhost:3000/api/integrations/google-calendar/callback`
   - Production: `https://yourdomain.com/api/integrations/google-calendar/callback`

6. Click **Create**

7. **Copy your credentials**:
   - Client ID (looks like: `123456789-abc123.apps.googleusercontent.com`)
   - Client Secret (looks like: `GOCSPX-abc123xyz`)

---

## Environment Configuration

### Step 1: Update `.env.local`

Add these variables to your `.env.local` file:

```bash
# Google Calendar OAuth
GOOGLE_CLIENT_ID="your_client_id_here.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your_client_secret_here"
GOOGLE_REDIRECT_URI="http://localhost:3000/api/integrations/google-calendar/callback"
```

### Step 2: Production Environment

For production (Vercel, etc.), set:

```bash
GOOGLE_REDIRECT_URI="https://yourdomain.com/api/integrations/google-calendar/callback"
```

**Important**: Make sure this matches exactly what you configured in Google Cloud Console.

---

## Database Setup

The integration uses the `integrations` table in your database.

### Schema

The table was created with these fields:

```prisma
model integrations {
  id                String    @id @default(uuid())
  user_id           String
  team_id           String?
  provider          String
  access_token      String?
  refresh_token     String?
  token_expires_at  DateTime?
  account_email     String?
  settings          Json      @default("{}")
  connected_at      DateTime  @default(now())
  updated_at        DateTime  @updatedAt
  users             users     @relation(fields: [user_id], references: [id], onDelete: Cascade)
  teams             teams?    @relation(fields: [team_id], references: [id], onDelete: Cascade)

  @@unique([user_id, provider])
  @@index([team_id])
}
```

### Verify Database

Run this command to ensure the table exists:

```bash
npx prisma db push
```

---

## Testing the Integration

### Step 1: Start Development Server

```bash
npm run dev
```

### Step 2: Navigate to Settings

1. Open `http://localhost:3000`
2. Log in to your account
3. Go to **Dashboard** → **Settings**
4. Click on the **Integrations** tab

### Step 3: Connect Google Calendar

1. Click **Connect** button next to Google Calendar
2. You'll be redirected to Google's authorization page
3. Select your Google account
4. Review the permissions requested
5. Click **Allow**
6. You'll be redirected back to Settings with a success message

### Step 4: Verify Connection

You should see:
- ✅ "Connected" badge
- Your Google account email displayed
- **Disconnect** button available

### Step 5: Test Disconnect

1. Click **Disconnect**
2. Confirm the action
3. The integration should be removed
4. **Connect** button should reappear

---

## Usage Examples

### Example 1: Attach Tasks to Calendar Event

```typescript
import { attachTasksToEvent } from '@/lib/google-calendar';

// After processing a meeting
const result = await attachTasksToEvent(
  userId,
  'Weekly Team Sync',
  new Date('2026-05-10'),
  [
    { 
      title: 'Update project roadmap', 
      assignee: 'John Doe',
      deadline: '2026-05-15'
    },
    { 
      title: 'Review PR #123', 
      assignee: 'Jane Smith',
      deadline: '2026-05-12'
    },
  ]
);

if (result.success) {
  console.log('Tasks attached to calendar event!');
}
```

### Example 2: Check if User Has Connected Calendar

```typescript
import { getCalendarClient } from '@/lib/google-calendar';

const calendar = await getCalendarClient(userId);

if (calendar) {
  console.log('User has Google Calendar connected');
  // Proceed with calendar operations
} else {
  console.log('User needs to connect Google Calendar');
  // Show connection prompt
}
```

### Example 3: List Upcoming Events

```typescript
import { listUpcomingEvents } from '@/lib/google-calendar';

try {
  const events = await listUpcomingEvents(userId, 10);
  console.log(`Found ${events.length} upcoming events`);
  
  events.forEach(event => {
    console.log(`- ${event.summary} at ${event.start?.dateTime}`);
  });
} catch (error) {
  console.error('Failed to fetch events:', error);
}
```

---

## Troubleshooting

### Issue: "Redirect URI mismatch" Error

**Cause**: The redirect URI in your code doesn't match Google Cloud Console configuration.

**Solution**:
1. Check `GOOGLE_REDIRECT_URI` in `.env.local`
2. Verify it matches exactly in Google Cloud Console
3. Include the protocol (`http://` or `https://`)
4. No trailing slashes

### Issue: "Access blocked: This app's request is invalid"

**Cause**: OAuth consent screen not properly configured.

**Solution**:
1. Go to OAuth consent screen in Google Cloud Console
2. Ensure all required fields are filled
3. Add your email as a test user (for development)
4. Verify scopes are added correctly

### Issue: Token Expired Errors

**Cause**: Access token has expired and refresh failed.

**Solution**:
- The system automatically refreshes tokens
- If refresh fails, user needs to reconnect
- Check that `refresh_token` is stored in database

### Issue: "Calendar event not found"

**Cause**: Event title doesn't match or event is on a different date.

**Solution**:
- Ensure meeting title matches calendar event summary
- Check the date is correct
- The search is case-insensitive and supports partial matches

### Issue: Database Connection Errors

**Cause**: Prisma client not generated or database not accessible.

**Solution**:
```bash
npx prisma generate
npx prisma db push
```

---

## API Reference

### Routes

#### `GET /api/integrations/google-calendar/connect`
Initiates OAuth flow by redirecting to Google authorization page.

**Response**: Redirect to Google OAuth

---

#### `GET /api/integrations/google-calendar/callback`
Handles OAuth callback from Google.

**Query Parameters**:
- `code`: Authorization code from Google
- `state`: CSRF protection token

**Response**: Redirect to `/dashboard/settings?tab=integrations&connected=google_calendar`

---

#### `GET /api/integrations/google-calendar`
Check connection status.

**Response**:
```json
{
  "connected": true,
  "accountEmail": "user@gmail.com",
  "connectedAt": "2026-05-05T22:00:00.000Z",
  "tokenExpiresAt": "2026-05-05T23:00:00.000Z"
}
```

---

#### `DELETE /api/integrations/google-calendar`
Disconnect Google Calendar.

**Response**:
```json
{
  "success": true,
  "message": "Google Calendar disconnected successfully"
}
```

---

### Helper Functions

#### `getAuthorizationUrl(state?: string): string`
Generate Google OAuth authorization URL.

**Parameters**:
- `state` (optional): CSRF protection token

**Returns**: Authorization URL string

---

#### `exchangeCodeForTokens(code: string): Promise<Credentials>`
Exchange authorization code for access and refresh tokens.

**Parameters**:
- `code`: Authorization code from OAuth callback

**Returns**: Token credentials object

---

#### `getCalendarClient(userId: string): Promise<calendar_v3.Calendar | null>`
Get authenticated Google Calendar client for a user.

**Parameters**:
- `userId`: User ID

**Returns**: Authenticated calendar client or null if not connected

---

#### `attachTasksToEvent(userId, eventTitle, date, tasks): Promise<Result>`
Attach tasks to a calendar event.

**Parameters**:
- `userId`: User ID
- `eventTitle`: Meeting/event title
- `date`: Date of the event
- `tasks`: Array of task objects

**Returns**:
```typescript
{
  success: boolean;
  message: string;
  eventId?: string;
}
```

---

#### `listUpcomingEvents(userId, maxResults?): Promise<Event[]>`
List upcoming calendar events.

**Parameters**:
- `userId`: User ID
- `maxResults` (optional): Maximum events to return (default: 10)

**Returns**: Array of calendar events

---

## Security Considerations

### Token Storage
- Access tokens are encrypted in the database
- Refresh tokens are stored securely
- Tokens are never exposed to the client

### CSRF Protection
- State parameter validates OAuth callbacks
- Timestamps prevent replay attacks
- User session verified before operations

### Scope Limitations
- Only requests necessary calendar permissions
- Read-only access to calendar list
- Write access limited to event descriptions

---

## Production Checklist

Before deploying to production:

- [ ] Update `GOOGLE_REDIRECT_URI` to production URL
- [ ] Add production redirect URI to Google Cloud Console
- [ ] Move OAuth consent screen from "Testing" to "Published"
- [ ] Set up proper error monitoring
- [ ] Test token refresh mechanism
- [ ] Verify database backups include `integrations` table
- [ ] Add rate limiting to API routes
- [ ] Set up logging for OAuth failures

---

## Related Files

- [`lib/google-calendar.ts`](lib/google-calendar.ts) - Core integration logic
- [`app/api/integrations/google-calendar/connect/route.ts`](app/api/integrations/google-calendar/connect/route.ts) - OAuth initiation
- [`app/api/integrations/google-calendar/callback/route.ts`](app/api/integrations/google-calendar/callback/route.ts) - OAuth callback handler
- [`app/api/integrations/google-calendar/route.ts`](app/api/integrations/google-calendar/route.ts) - Status and disconnect
- [`app/dashboard/settings/page.tsx`](app/dashboard/settings/page.tsx) - UI integration
- [`prisma/schema.prisma`](prisma/schema.prisma) - Database schema

---

## Support

For issues or questions:
1. Check the [Troubleshooting](#troubleshooting) section
2. Review Google Calendar API documentation
3. Check application logs for detailed error messages
4. Verify all environment variables are set correctly

---

## Future Enhancements

Potential improvements for the integration:

- [ ] Support for multiple calendar accounts
- [ ] Calendar event creation from meetings
- [ ] Two-way sync between tasks and calendar
- [ ] Calendar selection (primary vs other calendars)
- [ ] Recurring event support
- [ ] Calendar notifications
- [ ] Team calendar sharing

---

**Last Updated**: May 5, 2026
**Version**: 1.0.0
