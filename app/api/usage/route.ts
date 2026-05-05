import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/clerk-utils"
import { checkUsageLimit } from "@/lib/usage"

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const usage = await checkUsageLimit(user.id)

    return NextResponse.json(usage)
  } catch (error) {
    console.error("Fetch usage error:", error)
    return NextResponse.json(
      { error: "Failed to fetch usage" },
      { status: 500 }
    )
  }
}
