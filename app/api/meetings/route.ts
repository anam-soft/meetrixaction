import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/clerk-utils"
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

    // Parse form data
    const formData = await request.formData()
    const file = formData.get("file") as File
    const title = formData.get("title") as string
    
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ["audio/mpeg", "audio/mp3", "audio/wav", "video/mp4"]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Allowed: mp3, wav, mp4" },
        { status: 400 }
      )
    }

    // Validate file size (100MB max)
    const maxSize = 100 * 1024 * 1024 // 100MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File too large. Maximum size: 100MB" },
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

    return NextResponse.json({
      success: true,
      meeting: {
        id: meeting.id,
        title: meeting.title,
        status: meeting.status,
        fileUrl,
      },
    })
  } catch (error) {
    console.error("Upload error:", error)
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
    console.error("Fetch meetings error:", error)
    return NextResponse.json(
      { error: "Failed to fetch meetings" },
      { status: 500 }
    )
  }
}
