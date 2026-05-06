import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth-utils"
import { prisma } from "@/lib/prisma"
import { checkUsageLimit } from "@/lib/usage"

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check database directly
    const subscription = await prisma.subscriptions.findUnique({
      where: { user_id: user.id },
    })

    // Check usage API
    const usage = await checkUsageLimit(user.id)

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
      },
      database_subscription: subscription ? {
        id: subscription.id,
        plan: subscription.plan,
        stripe_status: subscription.stripe_status,
        stripe_subscription_id: subscription.stripe_subscription_id,
      } : null,
      usage_check: usage,
      diagnosis: {
        has_subscription_in_db: !!subscription,
        subscription_plan: subscription?.plan || 'none',
        subscription_status: subscription?.stripe_status || 'none',
        usage_says_pro: usage.isPro,
        issue: subscription && subscription.plan === 'pro' && subscription.stripe_status === 'active' && !usage.isPro
          ? "❌ MISMATCH: Subscription is Pro in DB but usage check says not Pro"
          : subscription && subscription.plan === 'pro' && subscription.stripe_status === 'active' && usage.isPro
          ? "✅ WORKING: Everything is correct"
          : !subscription
          ? "❌ NO SUBSCRIPTION: No subscription in database"
          : "⚠️ CHECK DETAILS ABOVE"
      }
    })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to test subscription", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
