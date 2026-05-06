import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth-utils"
import { prisma } from "@/lib/prisma"

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }


    // Your subscription details from Stripe
    const subscriptionData = {
      stripe_subscription_id: "sub_1TTjFWRuoH55oHIoOpTpBorf",
      stripe_customer_id: "cus_USeYHP2fs9qIcJ",
      stripe_price_id: "price_1TTYZARuoH55oHIomeva2qdo",
      stripe_status: "active",
      plan: "pro",
    }

    // Calculate period dates (use current date + 30 days)
    const now = new Date()
    const endDate = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000))

    const subscription = await prisma.subscriptions.upsert({
      where: { user_id: user.id },
      update: {
        stripe_subscription_id: subscriptionData.stripe_subscription_id,
        stripe_customer_id: subscriptionData.stripe_customer_id,
        stripe_price_id: subscriptionData.stripe_price_id,
        stripe_status: subscriptionData.stripe_status,
        plan: subscriptionData.plan,
        current_period_start: now,
        current_period_end: endDate,
        cancel_at_period_end: false,
        updated_at: new Date(),
      },
      create: {
        id: crypto.randomUUID(),
        user_id: user.id,
        stripe_subscription_id: subscriptionData.stripe_subscription_id,
        stripe_customer_id: subscriptionData.stripe_customer_id,
        stripe_price_id: subscriptionData.stripe_price_id,
        stripe_status: subscriptionData.stripe_status,
        plan: subscriptionData.plan,
        current_period_start: now,
        current_period_end: endDate,
        cancel_at_period_end: false,
        created_at: new Date(),
        updated_at: new Date(),
      },
    })


    return NextResponse.json({
      success: true,
      message: "Subscription force-created successfully!",
      subscription: {
        id: subscription.id,
        plan: subscription.plan,
        status: subscription.stripe_status,
        current_period_start: subscription.current_period_start,
        current_period_end: subscription.current_period_end,
      }
    })
  } catch (error) {
    console.error("Force create subscription error:", error)
    return NextResponse.json(
      { 
        success: false,
        error: "Failed to create subscription",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}
