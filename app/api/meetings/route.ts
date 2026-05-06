import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth-utils"
import { checkUsageLimit, incrementUsage } from "@/lib/usage"
import { uploadToS3 } from "@/lib/s3"
import { prisma } from "@/lib/prisma"

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check usage limits
    const usage = await checkUsageLimit(user.id)
    
    if (!usage.canUpload) {
      return NextResponse.json(
        {
          error: "Usage limit reached",
          message: `You've reached your limit of ${usage.limit} meetings per month. Upgrade to Pro for unlimited meetings.`,
          currentUsage: usage.currentUsage,
          limit: usage.limit,
        },
        { status: 403 }
      )
    }

    const contentType = request.headers.get("content-type") || ""
    
    // Handle JSON (transcript paste)
    if (contentType.includes("application/json")) {
      const body = await request.json()
      const { transcript, title } = body
      
      if (!transcript || !transcript.trim()) {
        return NextResponse.json({ error: "No transcript provided" }, { status: 400 })
      }

      // Create meeting record with transcript
      const meeting = await prisma.meetings.create({
        data: {
          id: crypto.randomUUID(),
          title: title || "Untitled Meeting",
          transcript: transcript.trim(),
          status: "uploaded",
          user_id: user.id,
          created_at: new Date(),
          updated_at: new Date(),
        },
      })

      // Increment usage
      await incrementUsage(user.id)

      // TODO: Trigger AI processing to extract tasks
      // For now, return mock task count
      const taskCount = 0

      return NextResponse.json({
        success: true,
        meetingId: meeting.id,
        taskCount,
      })
    }
    
    // Handle FormData (file upload)
    const formData = await request.formData()
    const file = formData.get("file") as File
    const title = formData.get("title") as string
    
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = [
      "audio/mpeg",
      "audio/mp3",
      "audio/wav",
      "audio/m4a",
      "audio/x-m4a",
      "video/mp4",
      "video/quicktime",
      "video/x-msvideo",
      "video/webm",
    ]
    if (!allowedTypes.includes(file.type) &&
        ![".mp3", ".wav", ".m4a", ".mp4", ".mov", ".avi", ".webm"].some(ext =>
          file.name.toLowerCase().endsWith(ext)
        )) {
      return NextResponse.json(
        { error: "Invalid file type. Allowed: MP3, WAV, M4A, MP4, MOV, AVI, WebM" },
        { status: 400 }
      )
    }

    // Validate file size (200MB max for free, unlimited for Pro)
    const maxSize = usage.isPro ? Infinity : 200 * 1024 * 1024 // 200MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `File too large. Maximum size: ${usage.isPro ? "unlimited" : "200MB"}` },
        { status: 400 }
      )
    }

    // Upload to S3
    const buffer = Buffer.from(await file.arrayBuffer())
    const { fileUrl, key } = await uploadToS3(buffer, file.name, file.type)

    // Create meeting record
    const meeting = await prisma.meetings.create({
      data: {
        id: crypto.randomUUID(),
        title: title || file.name,
        file_name: file.name,
        file_path: key,
        file_size: file.size,
        file_type: file.type,
        status: "uploaded",
        user_id: user.id,
        created_at: new Date(),
        updated_at: new Date(),
      },
    })

    // Increment usage
    await incrementUsage(user.id)

    // TODO: Trigger transcription and AI processing
    // For now, return mock task count
    const taskCount = 0

    return NextResponse.json({
      success: true,
      meetingId: meeting.id,
      taskCount,
    })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to upload meeting" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const meetingId = searchParams.get("id")

    // Fetch single meeting
    if (meetingId) {
      const meeting = await prisma.meetings.findFirst({
        where: {
          id: meetingId,
          user_id: user.id,
        },
        include: {
          tasks: {
            include: {
              users: {
                select: {
                  name: true,
                  avatar: true,
                },
              },
            },
          },
        },
      })

      if (!meeting) {
        return NextResponse.json({ error: "Meeting not found" }, { status: 404 })
      }

      return NextResponse.json({ meeting })
    }

    // Fetch all meetings
    const meetings = await prisma.meetings.findMany({
      where: { user_id: user.id },
      orderBy: { created_at: "desc" },
      include: {
        tasks: {
          select: {
            id: true,
            status: true,
          },
        },
      },
    })

    return NextResponse.json({ meetings })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch meetings" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const meetingId = searchParams.get("id")

    if (!meetingId) {
      return NextResponse.json({ error: "Meeting ID required" }, { status: 400 })
    }

    // Verify ownership
    const meeting = await prisma.meetings.findFirst({
      where: {
        id: meetingId,
        user_id: user.id,
      },
    })

    if (!meeting) {
      return NextResponse.json({ error: "Meeting not found" }, { status: 404 })
    }

    // Delete associated tasks first
    await prisma.tasks.deleteMany({
      where: { meeting_id: meetingId },
    })

    // Delete meeting
    await prisma.meetings.delete({
      where: { id: meetingId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete meeting" },
      { status: 500 }
    )
  }
}
