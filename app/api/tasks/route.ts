import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth-utils"
import { prisma } from "@/lib/prisma"

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const meetingId = searchParams.get("meetingId")
    const status = searchParams.get("status")

    const where: any = {
      meetings: {
        user_id: user.id,
      },
    }

    if (meetingId) {
      where.meeting_id = meetingId
    }

    if (status) {
      where.status = status
    }

    const tasks = await prisma.tasks.findMany({
      where,
      include: {
        meetings: {
          select: {
            id: true,
            title: true,
          },
        },
        users: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { created_at: "desc" },
    })

    return NextResponse.json({ tasks })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { taskId, status, title, description, deadline, assigneeId } = body

    if (!taskId) {
      return NextResponse.json({ error: "Task ID required" }, { status: 400 })
    }

    // Verify task belongs to user's meeting
    const task = await prisma.tasks.findUnique({
      where: { id: taskId },
      include: {
        meetings: true,
      },
    })

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    if (task.meetings.user_id !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Update task
    const updateData: any = {
      updated_at: new Date(),
    }

    if (status !== undefined) {
      updateData.status = status
      if (status === "completed") {
        updateData.completed_at = new Date()
      }
    }

    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (deadline !== undefined) updateData.deadline = deadline ? new Date(deadline) : null
    if (assigneeId !== undefined) updateData.assignee_id = assigneeId

    const updatedTask = await prisma.tasks.update({
      where: { id: taskId },
      data: updateData,
      include: {
        meetings: {
          select: {
            id: true,
            title: true,
          },
        },
        users: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json({ task: updatedTask })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update task" },
      { status: 500 }
    )
  }
}
