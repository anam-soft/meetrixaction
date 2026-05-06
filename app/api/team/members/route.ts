import { NextRequest, NextResponse } from "next/server"
import { getAuth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"

// GET - Fetch team members
export async function GET(req: NextRequest) {
  try {
    const { userId } = getAuth(req)

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user from database
    const user = await prisma.users.findUnique({
      where: { clerk_id: userId },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // For now, return mock data since team functionality requires more setup
    // In production, you would fetch from team_members table
    const members = [
      {
        id: user.id,
        name: user.name || "You",
        email: user.email || "",
        avatar: user.avatar,
        role: "admin",
        tasksAssigned: 0,
        tasksCompleted: 0,
        joinedAt: user.created_at.toISOString(),
      },
    ]

    // Get task counts for the user
    const tasks = await prisma.tasks.findMany({
      where: { assignee_id: user.id },
    })

    members[0].tasksAssigned = tasks.length
    members[0].tasksCompleted = tasks.filter(t => t.status === "completed").length

    return NextResponse.json({ members })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch team members" },
      { status: 500 }
    )
  }
}

// DELETE - Remove team member
export async function DELETE(req: NextRequest) {
  try {
    const { userId } = getAuth(req)

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const memberId = searchParams.get("id")

    if (!memberId) {
      return NextResponse.json({ error: "Member ID required" }, { status: 400 })
    }

    // Check if user is admin (in production)
    // For now, just return success
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to remove team member" },
      { status: 500 }
    )
  }
}
