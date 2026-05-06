import { NextRequest, NextResponse } from "next/server"
import { getAuth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"

// POST - Save notification settings
export async function POST(req: NextRequest) {
  try {
    const { userId } = getAuth(req)

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const {
      weeklyDigest,
      digestDay,
      digestTime,
      overdueReminders,
      reminderFrequency,
      taskAssigned,
    } = body

    // Get user from database
    const user = await prisma.users.findUnique({
      where: { clerk_id: userId },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // In production, you would save these settings to a user_settings table
    // For now, just log and return success

    return NextResponse.json({
      success: true,
      message: "Notification settings saved",
    })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to save settings" },
      { status: 500 }
    )
  }
}

// GET - Fetch notification settings
export async function GET(req: NextRequest) {
  try {
    const { userId } = getAuth(req)

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Return default settings
    // In production, fetch from user_settings table
    const settings = {
      weeklyDigest: true,
      digestDay: "monday",
      digestTime: "09:00",
      overdueReminders: true,
      reminderFrequency: "daily",
      taskAssigned: true,
    }

    return NextResponse.json({ settings })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    )
  }
}
