import Stripe from "stripe"
import { prisma } from "./prisma"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-04-22.dahlia",
})

/**
 * Sync subscription from Stripe to local database
 * This is useful when webhooks haven't fired yet or failed
 */
export async function syncSubscriptionFromStripe(userId: string) {
  try {
    // Get user's subscription from database
    let subscription = await prisma.subscriptions.findUnique({
      where: { user_id: userId },
    })

    // If subscription exists and is active, return it
    if (subscription && subscription.stripe_status === "active") {
      console.log("Found active subscription in database:", subscription.id)
      return subscription
    }

    console.log("No active subscription in database, checking Stripe...")

    // If no subscription or not active, check Stripe directly
    let stripeCustomerId = subscription?.stripe_customer_id

    // If no customer ID in subscription, try to find customer by user email
    if (!stripeCustomerId) {
      const user = await prisma.users.findUnique({
        where: { id: userId },
      })

      if (!user?.email) {
        console.log("No user email found, cannot search Stripe")
        return null
      }

      // Search for customer by email in Stripe
      const customers = await stripe.customers.list({
        email: user.email,
        limit: 1,
      })

      if (customers.data.length === 0) {
        console.log("No Stripe customer found for email:", user.email)
        return null
      }

      stripeCustomerId = customers.data[0].id
      console.log("Found Stripe customer:", stripeCustomerId)
    }

    // Fetch subscriptions from Stripe
    console.log("Fetching subscriptions from Stripe for customer:", stripeCustomerId)
    const stripeSubscriptions = await stripe.subscriptions.list({
      customer: stripeCustomerId,
      status: "active",
      limit: 1,
      expand: ['data.default_payment_method'],
    })

    console.log("Found", stripeSubscriptions.data.length, "active subscriptions in Stripe")

    if (stripeSubscriptions.data.length === 0) {
      // No active subscriptions in Stripe
      console.log("No active subscriptions found in Stripe")
      return null
    }

    // Found active subscription in Stripe, sync it to database
    const stripeSubscription = stripeSubscriptions.data[0]
    console.log("Syncing subscription to database:", stripeSubscription.id)
    
    // Retrieve the full subscription with expanded data
    const fullSubscription = await stripe.subscriptions.retrieve(stripeSubscription.id, {
      expand: ['latest_invoice', 'customer']
    })
    console.log("Retrieved full subscription:", fullSubscription.id)
    console.log("Subscription status:", fullSubscription.status)
    console.log("Subscription object keys:", Object.keys(fullSubscription))
    
    // Try to get period dates - they should be at the root level
    let currentPeriodStart = (fullSubscription as any).current_period_start
    let currentPeriodEnd = (fullSubscription as any).current_period_end
    
    console.log("Period start (direct):", currentPeriodStart)
    console.log("Period end (direct):", currentPeriodEnd)
    
    // If still not available, use created date and calculate end date (1 month later)
    if (!currentPeriodStart || !currentPeriodEnd) {
      console.warn("Period dates not available, using created date")
      currentPeriodStart = fullSubscription.created
      // Add 30 days (approximate month)
      currentPeriodEnd = fullSubscription.created + (30 * 24 * 60 * 60)
    }
    
    console.log("Final period start:", currentPeriodStart, "=>", new Date(currentPeriodStart * 1000))
    console.log("Final period end:", currentPeriodEnd, "=>", new Date(currentPeriodEnd * 1000))

    // Validate dates
    if (!currentPeriodStart || !currentPeriodEnd || isNaN(currentPeriodStart) || isNaN(currentPeriodEnd)) {
      console.error("Invalid period dates from Stripe subscription")
      console.error("Subscription data:", {
        id: fullSubscription.id,
        status: fullSubscription.status,
        created: fullSubscription.created,
        currentPeriodStart,
        currentPeriodEnd,
      })
      // Don't return null - create subscription anyway with created date
      currentPeriodStart = fullSubscription.created
      currentPeriodEnd = fullSubscription.created + (30 * 24 * 60 * 60)
    }

    subscription = await prisma.subscriptions.upsert({
      where: { user_id: userId },
      update: {
        stripe_subscription_id: fullSubscription.id,
        stripe_customer_id: fullSubscription.customer as string,
        stripe_price_id: fullSubscription.items.data[0].price.id,
        stripe_status: fullSubscription.status,
        plan: "pro",
        current_period_start: new Date(currentPeriodStart * 1000),
        current_period_end: new Date(currentPeriodEnd * 1000),
        cancel_at_period_end: fullSubscription.cancel_at_period_end,
        updated_at: new Date(),
      },
      create: {
        id: crypto.randomUUID(),
        user_id: userId,
        stripe_subscription_id: fullSubscription.id,
        stripe_customer_id: fullSubscription.customer as string,
        stripe_price_id: fullSubscription.items.data[0].price.id,
        stripe_status: fullSubscription.status,
        plan: "pro",
        current_period_start: new Date(currentPeriodStart * 1000),
        current_period_end: new Date(currentPeriodEnd * 1000),
        cancel_at_period_end: fullSubscription.cancel_at_period_end,
        created_at: new Date(),
        updated_at: new Date(),
      },
    })

    console.log("Successfully synced subscription:", subscription.id)

    return subscription
  } catch (error) {
    console.error("Error syncing subscription from Stripe:", error)
    return null
  }
}
