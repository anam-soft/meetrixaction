import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth-utils"
import { prisma } from "@/lib/prisma"

export const dynamic = 'force-dynamic'

interface AnalyticsEvent {
  event: string
  userId?: string
  currentUsage?: number
  limit?: number
  source?: string
  timestamp: string
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    const eventData: AnalyticsEvent = await request.json()

    // Log event (in production, send to analytics service)
      ...eventData,
      userId: user?.id || eventData.userId,
    })

    // Store in database for internal analytics
    // You could create an analytics_events table for this
    
    // For now, just acknowledge receipt
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Analytics tracking error:", error)
    // Don't fail the request if analytics fails
    return NextResponse.json({ success: false }, { status: 200 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Calculate conversion metrics
    // This is a simplified version - in production, use proper analytics
    
    const totalUsers = await prisma.users.count()
    const proUsers = await prisma.subscriptions.count({
      where: {
        plan: "pro",
        stripe_status: "active",
      },
    })

    const conversionRate = totalUsers > 0 
      ? ((proUsers / totalUsers) * 100).toFixed(2)
      : 0

    // Get usage stats
    const currentMonth = new Date().toISOString().slice(0, 7)
    const usageRecords = await prisma.usage_records.findMany({
      where: {
        month: currentMonth,
      },
    })

    const usersAtLimit = usageRecords.filter(
      (record) => record.meetings_created >= 5
    ).length

    const metrics = {
      totalUsers,
      proUsers,
      freeUsers: totalUsers - proUsers,
      conversionRate: `${conversionRate}%`,
      usersAtLimit,
      potentialConversions: usersAtLimit,
    }

    return NextResponse.json(metrics)
  } catch (error) {
    console.error("Metrics error:", error)
    return NextResponse.json(
      { error: "Failed to fetch metrics" },
      { status: 500 }
    )
  }
}
