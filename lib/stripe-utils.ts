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
    
    // Access the properties with proper typing
    const currentPeriodStart = (stripeSubscription as any).current_period_start
    const currentPeriodEnd = (stripeSubscription as any).current_period_end
    
    console.log("Period start:", currentPeriodStart, "Period end:", currentPeriodEnd)

    // Validate dates before creating
    if (!currentPeriodStart || !currentPeriodEnd) {
      console.error("Invalid period dates from Stripe subscription")
      console.error("Subscription data:", {
        id: stripeSubscription.id,
        status: stripeSubscription.status,
      })
      return null
    }

    subscription = await prisma.subscriptions.upsert({
      where: { user_id: userId },
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
        user_id: userId,
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

    console.log("Successfully synced subscription:", subscription.id)

    return subscription
  } catch (error) {
    console.error("Error syncing subscription from Stripe:", error)
    return null
  }
}
