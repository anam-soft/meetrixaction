import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth-utils"
import { analyzeMeetingTranscript, transcribeAudio } from "@/lib/openai"
import { incrementAIProcessed } from "@/lib/usage"
import { prisma } from "@/lib/prisma"

export const dynamic = 'force-dynamic'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const meetingId = params.id

    // Get meeting
    const meeting = await prisma.meetings.findUnique({
      where: { id: meetingId },
    })

    if (!meeting) {
      return NextResponse.json({ error: "Meeting not found" }, { status: 404 })
    }

    if (meeting.user_id !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    if (meeting.status === "processing") {
      return NextResponse.json(
        { error: "Meeting is already being processed" },
        { status: 400 }
      )
    }

    // Update status to processing
    await prisma.meetings.update({
      where: { id: meetingId },
      data: { 
        status: "processing",
        updated_at: new Date(),
      },
    })

    // Process in background (in production, use a queue like BullMQ)
    processMeeting(meetingId, user.id).catch(console.error)

    return NextResponse.json({
      success: true,
      message: "Meeting processing started",
      meetingId,
    })
  } catch (error) {
    console.error("Process meeting error:", error)
    return NextResponse.json(
      { error: "Failed to process meeting" },
      { status: 500 }
    )
  }
}

async function processMeeting(meetingId: string, userId: string) {
  try {
    const meeting = await prisma.meetings.findUnique({
      where: { id: meetingId },
    })

    if (!meeting) return

    let transcript = meeting.transcript

    // If no transcript, transcribe the audio
    if (!transcript && meeting.file_path) {
      // In production, construct the full S3 URL
      const fileUrl = `${process.env.S3_PUBLIC_URL || process.env.S3_ENDPOINT}/${process.env.S3_BUCKET}/${meeting.file_path}`
      transcript = await transcribeAudio(fileUrl)
      
      await prisma.meetings.update({
        where: { id: meetingId },
        data: { 
          transcript,
          updated_at: new Date(),
        },
      })
    }

    if (!transcript) {
      throw new Error("No transcript available")
    }

    // Analyze transcript
    const analysis = await analyzeMeetingTranscript(transcript)

    // Update meeting with summary and decisions
    await prisma.meetings.update({
      where: { id: meetingId },
      data: {
        summary: analysis.summary,
        decisions: analysis.decisions.join("\n"),
        status: "done",
        updated_at: new Date(),
      },
    })

    // Create tasks
    for (const item of analysis.actionItems) {
      await prisma.tasks.create({
        data: {
          id: crypto.randomUUID(),
          title: item.title,
          description: item.description,
          meeting_id: meetingId,
          confidence: item.confidence,
          deadline: item.deadline ? new Date(item.deadline) : null,
          status: "pending",
          created_at: new Date(),
          updated_at: new Date(),
        },
      })
    }

    // Increment AI processed count
    await incrementAIProcessed(userId)

  } catch (error) {
    console.error("Meeting processing failed:", error)
    
    // Update status to failed
    await prisma.meetings.update({
      where: { id: meetingId },
      data: { 
        status: "failed",
        updated_at: new Date(),
      },
    })
  }
}
