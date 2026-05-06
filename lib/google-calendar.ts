/**
 * Google Calendar Integration Helper
 * 
 * This module provides utilities for:
 * - Authenticating with Google Calendar API
 * - Refreshing expired tokens
 * - Attaching tasks to calendar events
 */

import { google } from 'googleapis';
import { prisma } from './prisma';

// OAuth2 scopes required for Google Calendar
const SCOPES = [
  'https://www.googleapis.com/auth/calendar.readonly',
  'https://www.googleapis.com/auth/calendar.events',
];

/**
 * Get OAuth2 client with credentials from environment
 */
export function getOAuth2Client() {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  return oauth2Client;
}

/**
 * Generate Google OAuth authorization URL
 * @param state - Optional state parameter for CSRF protection
 */
export function getAuthorizationUrl(state?: string) {
  const oauth2Client = getOAuth2Client();

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline', // Request refresh token
    scope: SCOPES,
    prompt: 'consent', // Force consent screen to get refresh token
    state: state || '',
  });

  return authUrl;
}

/**
 * Exchange authorization code for tokens
 * @param code - Authorization code from Google OAuth callback
 */
export async function exchangeCodeForTokens(code: string) {
  const oauth2Client = getOAuth2Client();

  try {
    const { tokens } = await oauth2Client.getToken(code);
    return tokens;
  } catch (error) {
    console.error('Error exchanging code for tokens:', error);
    throw new Error('Failed to exchange authorization code');
  }
}

/**
 * Get user's Google account email
 * @param accessToken - Valid access token
 */
export async function getUserEmail(accessToken: string) {
  const oauth2Client = getOAuth2Client();
  oauth2Client.setCredentials({ access_token: accessToken });

  try {
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const { data } = await oauth2.userinfo.get();
    return data.email || null;
  } catch (error) {
    console.error('Error getting user email:', error);
    return null;
  }
}

/**
 * Refresh access token if expired
 * @param integration - Integration record from database
 */
async function refreshAccessToken(integration: any) {
  if (!integration.refresh_token) {
    throw new Error('No refresh token available');
  }

  const oauth2Client = getOAuth2Client();
  oauth2Client.setCredentials({
    refresh_token: integration.refresh_token,
  });

  try {
    const { credentials } = await oauth2Client.refreshAccessToken();
    
    // Update tokens in database
    await prisma.integrations.update({
      where: { id: integration.id },
      data: {
        access_token: credentials.access_token,
        token_expires_at: credentials.expiry_date 
          ? new Date(credentials.expiry_date) 
          : null,
      },
    });

    return credentials.access_token!;
  } catch (error) {
    console.error('Error refreshing access token:', error);
    throw new Error('Failed to refresh access token');
  }
}

/**
 * Get authenticated Google Calendar client for a user
 * @param userId - User ID
 * @returns Authenticated calendar client or null if not connected
 */
export async function getCalendarClient(userId: string) {
  // Fetch integration from database
  const integration = await prisma.integrations.findUnique({
    where: {
      user_id_provider: {
        user_id: userId,
        provider: 'google_calendar',
      },
    },
  });

  if (!integration || !integration.access_token) {
    return null;
  }

  // Check if token is expired
  const now = new Date();
  const isExpired = integration.token_expires_at && integration.token_expires_at < now;

  let accessToken = integration.access_token;

  // Refresh token if expired
  if (isExpired) {
    accessToken = await refreshAccessToken(integration);
  }

  // Create authenticated client
  const oauth2Client = getOAuth2Client();
  oauth2Client.setCredentials({
    access_token: accessToken,
    refresh_token: integration.refresh_token,
  });

  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

  return calendar;
}

/**
 * Revoke Google OAuth token
 * @param accessToken - Access token to revoke
 */
export async function revokeToken(accessToken: string) {
  const oauth2Client = getOAuth2Client();
  
  try {
    await oauth2Client.revokeToken(accessToken);
    return true;
  } catch (error) {
    console.error('Error revoking token:', error);
    return false;
  }
}

/**
 * Find calendar event by title and date
 * @param calendar - Authenticated calendar client
 * @param eventTitle - Title of the meeting/event
 * @param date - Date of the meeting
 */
async function findCalendarEvent(
  calendar: any,
  eventTitle: string,
  date: Date
) {
  try {
    // Search for events on the given date
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: startOfDay.toISOString(),
      timeMax: endOfDay.toISOString(),
      q: eventTitle, // Search query
      singleEvents: true,
      orderBy: 'startTime',
    });

    const events = response.data.items || [];
    
    // Find exact match or closest match
    const exactMatch = events.find((event: any) => 
      event.summary?.toLowerCase() === eventTitle.toLowerCase()
    );

    if (exactMatch) {
      return exactMatch;
    }

    // Return first partial match
    return events.find((event: any) => 
      event.summary?.toLowerCase().includes(eventTitle.toLowerCase())
    ) || null;
  } catch (error) {
    console.error('Error finding calendar event:', error);
    return null;
  }
}

/**
 * Attach tasks to a calendar event
 * @param userId - User ID
 * @param eventTitle - Title of the meeting/event
 * @param date - Date of the meeting
 * @param tasks - Array of tasks to attach
 */
export async function attachTasksToEvent(
  userId: string,
  eventTitle: string,
  date: Date,
  tasks: Array<{ title: string; assignee?: string; deadline?: string }>
) {
  try {
    // Get authenticated calendar client
    const calendar = await getCalendarClient(userId);
    
    if (!calendar) {
      throw new Error('Google Calendar not connected');
    }

    // Find the calendar event
    const event = await findCalendarEvent(calendar, eventTitle, date);
    
    if (!event) {
      console.log(`No calendar event found for "${eventTitle}" on ${date.toDateString()}`);
      return {
        success: false,
        message: 'Calendar event not found',
      };
    }

    // Format tasks as a note
    const taskList = tasks.map((task, index) => {
      let taskText = `${index + 1}. ${task.title}`;
      if (task.assignee) {
        taskText += ` (Assigned to: ${task.assignee})`;
      }
      if (task.deadline) {
        taskText += ` [Due: ${task.deadline}]`;
      }
      return taskText;
    }).join('\n');

    const taskNote = `\n\n📋 Action Items from MeetRix:\n${taskList}`;

    // Update event description
    const updatedDescription = (event.description || '') + taskNote;

    await calendar.events.patch({
      calendarId: 'primary',
      eventId: event.id,
      requestBody: {
        description: updatedDescription,
      },
    });

    return {
      success: true,
      message: `Tasks attached to "${event.summary}"`,
      eventId: event.id,
    };
  } catch (error) {
    console.error('Error attaching tasks to event:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to attach tasks',
    };
  }
}

/**
 * List upcoming calendar events
 * @param userId - User ID
 * @param maxResults - Maximum number of events to return (default: 10)
 */
export async function listUpcomingEvents(userId: string, maxResults: number = 10) {
  try {
    const calendar = await getCalendarClient(userId);
    
    if (!calendar) {
      throw new Error('Google Calendar not connected');
    }

    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: new Date().toISOString(),
      maxResults,
      singleEvents: true,
      orderBy: 'startTime',
    });

    return response.data.items || [];
  } catch (error) {
    console.error('Error listing events:', error);
    throw error;
  }
}
