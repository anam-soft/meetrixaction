/**
 * Google Calendar Integration Management Route
 *
 * Handles:
 * - GET: Check connection status
 * - DELETE: Disconnect Google Calendar
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-utils';
import { prisma } from '@/lib/prisma';
import { revokeToken } from '@/lib/google-calendar';

/**
 * GET - Check if Google Calendar is connected
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch integration from database
    const integration = await prisma.integrations.findUnique({
      where: {
        user_id_provider: {
          user_id: user.id,
          provider: 'google_calendar',
        },
      },
      select: {
        id: true,
        account_email: true,
        connected_at: true,
        token_expires_at: true,
      },
    });

    if (!integration) {
      return NextResponse.json({
        connected: false,
      });
    }

    return NextResponse.json({
      connected: true,
      accountEmail: integration.account_email,
      connectedAt: integration.connected_at,
      tokenExpiresAt: integration.token_expires_at,
    });
  } catch (error) {
    console.error('Error checking Google Calendar connection:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to check connection status',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Disconnect Google Calendar
 */
export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch integration to get access token
    const integration = await prisma.integrations.findUnique({
      where: {
        user_id_provider: {
          user_id: user.id,
          provider: 'google_calendar',
        },
      },
    });

    if (!integration) {
      return NextResponse.json(
        { error: 'Google Calendar not connected' },
        { status: 404 }
      );
    }

    // Revoke token with Google
    if (integration.access_token) {
      await revokeToken(integration.access_token);
    }

    // Delete integration from database
    await prisma.integrations.delete({
      where: {
        id: integration.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Google Calendar disconnected successfully',
    });
  } catch (error) {
    console.error('Error disconnecting Google Calendar:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to disconnect Google Calendar',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
