import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    return NextResponse.json({
      session,
      hasSession: !!session,
      user: session?.user || null,
    })
  } catch (error) {
    console.error("Debug session error:", error)
    return NextResponse.json(
      { error: "Failed to get session", details: String(error) },
      { status: 500 }
    )
  }
}
