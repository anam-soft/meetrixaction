import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth-utils"
import { syncSubscriptionFromStripe } from "@/lib/stripe-utils"
import { prisma } from "@/lib/prisma"

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { subscriptionId, customerId } = body


    // If subscription ID and customer ID provided, use them directly
    if (subscriptionId && customerId) {
      
      const Stripe = require("stripe")
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
        apiVersion: "2026-04-22.dahlia",
      })

      try {
        const stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId)
        
        if (stripeSubscription.customer !== customerId) {
          return NextResponse.json({
            success: false,
            message: "Subscription does not belong to this customer"
          })
        }

        const currentPeriodStart = (stripeSubscription as any).current_period_start
        const currentPeriodEnd = (stripeSubscription as any).current_period_end

        const subscription = await prisma.subscriptions.upsert({
          where: { user_id: user.id },
          update: {
            stripe_subscription_id: stripeSubscription.id,
            stripe_customer_id: stripeSubscription.customer as string,
            stripe_price_id: stripeSubscription.items.data[0].price.id,
            stripe_status: stripeSubscription.status,
            plan: "pro",
            current_period_start: new Date(currentPeriodStart * 1000),
            current_period_end: new Date(currentPeriodEnd * 1000),
            cancel_at_period_end: stripeSubscription.cancel_at_period_end,
            updated_at: new Date(),
          },
          create: {
            id: crypto.randomUUID(),
            user_id: user.id,
            stripe_subscription_id: stripeSubscription.id,
            stripe_customer_id: stripeSubscription.customer as string,
            stripe_price_id: stripeSubscription.items.data[0].price.id,
            stripe_status: stripeSubscription.status,
            plan: "pro",
            current_period_start: new Date(currentPeriodStart * 1000),
            current_period_end: new Date(currentPeriodEnd * 1000),
            cancel_at_period_end: stripeSubscription.cancel_at_period_end,
            created_at: new Date(),
            updated_at: new Date(),
          },
        })

        return NextResponse.json({
          success: true,
          message: "Subscription synced successfully using provided ID",
          subscription: {
            plan: subscription.plan,
            status: subscription.stripe_status,
          }
        })
      } catch (error) {
        return NextResponse.json({
          success: false,
          message: "Failed to sync with provided subscription ID",
          error: error instanceof Error ? error.message : String(error)
        })
      }
    }

    // Otherwise, try automatic sync
    const subscription = await syncSubscriptionFromStripe(user.id)

    if (!subscription) {
      return NextResponse.json({ 
        success: false,
        message: "No active subscription found in Stripe for your email. If you just paid, try using the 'Debug Info' button to find your subscription ID and sync manually.",
        showManualSync: true
      })
    }

    return NextResponse.json({ 
      success: true,
      message: "Subscription synced successfully",
      subscription: {
        plan: subscription.plan,
        status: subscription.stripe_status,
      }
    })
  } catch (error) {
    return NextResponse.json(
      { 
        success: false,
        error: "Failed to sync subscription",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}
