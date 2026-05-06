/**
 * Google Calendar OAuth Connect Route
 *
 * Initiates the Google OAuth flow by redirecting the user to Google's
 * authorization page where they can grant calendar access.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-utils';
import { getAuthorizationUrl } from '@/lib/google-calendar';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Generate state parameter for CSRF protection
    // Include user ID to verify on callback
    const state = Buffer.from(
      JSON.stringify({
        userId: user.id,
        timestamp: Date.now(),
      })
    ).toString('base64');

    // Generate Google OAuth authorization URL
    const authUrl = getAuthorizationUrl(state);

    // Redirect user to Google authorization page
    return NextResponse.redirect(authUrl);
  } catch (error) {
    
    return NextResponse.json(
      { 
        error: 'Failed to initiate Google Calendar connection',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
