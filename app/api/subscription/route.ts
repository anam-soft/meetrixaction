import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/clerk-utils"
import { prisma } from "@/lib/prisma"
import { syncSubscriptionFromStripe } from "@/lib/stripe-utils"

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user's subscription
    let subscription = await prisma.subscriptions.findUnique({
      where: { user_id: user.id },
    })

    // If no subscription found locally or not active, try syncing from Stripe
    if (!subscription || subscription.stripe_status !== "active") {
      subscription = await syncSubscriptionFromStripe(user.id)
    }

    if (!subscription) {
      return NextResponse.json({ subscription: null })
    }

    return NextResponse.json({ subscription })
  } catch (error) {
    console.error("Subscription fetch error:", error)
    return NextResponse.json(
      { error: "Failed to fetch subscription" },
      { status: 500 }
    )
  }
}
