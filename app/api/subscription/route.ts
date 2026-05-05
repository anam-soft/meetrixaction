import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth-utils"
import { prisma } from "@/lib/prisma"
import { syncSubscriptionFromStripe } from "@/lib/stripe-utils"

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("📊 Fetching subscription for user:", user.id)

    // Get user's subscription
    let subscription = await prisma.subscriptions.findUnique({
      where: { user_id: user.id },
    })

    console.log("Local subscription:", subscription ? `${subscription.plan} (${subscription.stripe_status})` : "none")

    // Always try syncing from Stripe if not active to catch any missed webhooks
    if (!subscription || subscription.stripe_status !== "active") {
      console.log("🔄 Attempting to sync from Stripe...")
      const syncedSubscription = await syncSubscriptionFromStripe(user.id)
      
      if (syncedSubscription) {
        console.log("✅ Synced subscription from Stripe:", syncedSubscription.plan)
        subscription = syncedSubscription
      } else {
        console.log("ℹ️ No active subscription in Stripe")
      }
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
