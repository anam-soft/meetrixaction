import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth-utils"
import { prisma } from "@/lib/prisma"

export const dynamic = 'force-dynamic'

/**
 * DEVELOPMENT ONLY: Create a mock Pro subscription for testing
 * This bypasses Stripe and creates a local subscription record
 */
export async function POST(request: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: "Not available in production" },
      { status: 403 }
    )
  }

  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }


    // Create or update subscription
    const subscription = await prisma.subscriptions.upsert({
      where: { user_id: user.id },
      update: {
        stripe_status: "active",
        plan: "pro",
        current_period_start: new Date(),
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        cancel_at_period_end: false,
        updated_at: new Date(),
      },
      create: {
        id: crypto.randomUUID(),
        user_id: user.id,
        stripe_customer_id: `cus_test_${user.id}`,
        stripe_subscription_id: `sub_test_${user.id}`,
        stripe_price_id: "price_test_mock",
        stripe_status: "active",
        plan: "pro",
        current_period_start: new Date(),
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        cancel_at_period_end: false,
        created_at: new Date(),
        updated_at: new Date(),
      },
    })


    return NextResponse.json({
      success: true,
      message: "Mock Pro subscription created",
      subscription: {
        id: subscription.id,
        plan: subscription.plan,
        status: subscription.stripe_status,
        period_end: subscription.current_period_end,
      },
    })
  } catch (error) {
    console.error("Error creating mock subscription:", error)
    return NextResponse.json(
      { error: "Failed to create mock subscription" },
      { status: 500 }
    )
  }
}

/**
 * DELETE: Remove mock subscription (revert to free)
 */
export async function DELETE(request: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: "Not available in production" },
      { status: 403 }
    )
  }

  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }


    await prisma.subscriptions.deleteMany({
      where: { user_id: user.id },
    })


    return NextResponse.json({
      success: true,
      message: "Reverted to Free plan",
    })
  } catch (error) {
    console.error("Error removing mock subscription:", error)
    return NextResponse.json(
      { error: "Failed to remove mock subscription" },
      { status: 500 }
    )
  }
}
