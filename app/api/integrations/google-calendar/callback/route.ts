/**
 * Google Calendar OAuth Callback Route
 *
 * Handles the OAuth callback from Google after user authorization.
 * Exchanges the authorization code for access and refresh tokens,
 * then stores them in the database.
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  exchangeCodeForTokens,
  getUserEmail
} from '@/lib/google-calendar';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    // Handle user denial
    if (error === 'access_denied') {
      return NextResponse.redirect(
        new URL(
          '/dashboard/settings?tab=integrations&error=access_denied',
          request.url
        )
      );
    }

    // Validate required parameters
    if (!code || !state) {
      return NextResponse.redirect(
        new URL(
          '/dashboard/settings?tab=integrations&error=invalid_callback',
          request.url
        )
      );
    }

    // Decode and validate state parameter
    let stateData: { userId: string; timestamp: number };
    try {
      stateData = JSON.parse(
        Buffer.from(state, 'base64').toString('utf-8')
      );
    } catch {
      return NextResponse.redirect(
        new URL(
          '/dashboard/settings?tab=integrations&error=invalid_state',
          request.url
        )
      );
    }

    // Verify state timestamp (prevent replay attacks)
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    if (stateData.timestamp < fiveMinutesAgo) {
      return NextResponse.redirect(
        new URL(
          '/dashboard/settings?tab=integrations&error=expired_state',
          request.url
        )
      );
    }

    const userId = stateData.userId;

    // Exchange authorization code for tokens
    const tokens = await exchangeCodeForTokens(code);

    if (!tokens.access_token) {
      throw new Error('No access token received from Google');
    }

    // Get user's Google account email
    const accountEmail = await getUserEmail(tokens.access_token);

    // Calculate token expiration date
    const tokenExpiresAt = tokens.expiry_date 
      ? new Date(tokens.expiry_date)
      : null;

    // Store integration in database
    await prisma.integrations.upsert({
      where: {
        user_id_provider: {
          user_id: userId,
          provider: 'google_calendar',
        },
      },
      create: {
        user_id: userId,
        provider: 'google_calendar',
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token || null,
        token_expires_at: tokenExpiresAt,
        account_email: accountEmail,
        settings: {},
      },
      update: {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token || null,
        token_expires_at: tokenExpiresAt,
        account_email: accountEmail,
        updated_at: new Date(),
      },
    });

    // Redirect back to settings page with success message
    return NextResponse.redirect(
      new URL(
        '/dashboard/settings?tab=integrations&connected=google_calendar',
        request.url
      )
    );
  } catch (error) {
    console.error('Error in Google Calendar OAuth callback:', error);
    
    return NextResponse.redirect(
      new URL(
        '/dashboard/settings?tab=integrations&error=connection_failed',
        request.url
      )
    );
  }
}
