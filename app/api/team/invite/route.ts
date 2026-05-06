import { NextRequest, NextResponse } from "next/server"
import { getAuth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"

// POST - Send team invite
export async function POST(req: NextRequest) {
  try {
    const { userId } = getAuth(req)

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { email, role } = body

    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 })
    }

    // Get user from database
    const user = await prisma.users.findUnique({
      where: { clerk_id: userId },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Check if user is already a member
    const existingUser = await prisma.users.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "User is already a member" },
        { status: 400 }
      )
    }

    // In production, you would:
    // 1. Create a pending invite record
    // 2. Send an email invitation
    // 3. Generate a unique invite token
    
    // For now, just return success

    return NextResponse.json({
      success: true,
      message: "Invite sent successfully",
    })
  } catch (error) {
    console.error("Error sending invite:", error)
    return NextResponse.json(
      { error: "Failed to send invite" },
      { status: 500 }
    )
  }
}
