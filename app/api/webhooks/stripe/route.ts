import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-04-22.dahlia",
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export const dynamic = 'force-dynamic'

// Track processed events to ensure idempotency
const processedEvents = new Map<string, number>()
const CACHE_DURATION = 60 * 60 * 1000 // 1 hour

function isEventProcessed(eventId: string): boolean {
  const timestamp = processedEvents.get(eventId)
  if (!timestamp) return false
  
  // Clean up old entries
  if (Date.now() - timestamp > CACHE_DURATION) {
    processedEvents.delete(eventId)
    return false
  }
  
  return true
}

function markEventProcessed(eventId: string) {
  processedEvents.set(eventId, Date.now())
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get("stripe-signature")!


    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
    }

    // Check if event was already processed (idempotency)
    if (isEventProcessed(event.id)) {
      return NextResponse.json({ received: true, skipped: true })
    }

    // Handle the event
    
    try {
      switch (event.type) {
        case "checkout.session.completed": {
          const session = event.data.object as Stripe.Checkout.Session
          await handleCheckoutCompleted(session)
          break
        }

        case "invoice.paid": {
          const invoice = event.data.object as Stripe.Invoice
          await handleInvoicePaid(invoice)
          break
        }

        case "customer.subscription.updated": {
          const subscription = event.data.object as Stripe.Subscription
          await handleSubscriptionUpdated(subscription)
          break
        }

        case "customer.subscription.deleted": {
          const subscription = event.data.object as Stripe.Subscription
          await handleSubscriptionDeleted(subscription)
          break
        }

        case "invoice.payment_failed": {
          const invoice = event.data.object as Stripe.Invoice
          await handlePaymentFailed(invoice)
          break
        }

        default:
      }

      // Mark event as processed
      markEventProcessed(event.id)
      
      return NextResponse.json({ received: true })
    } catch (handlerError) {
      // Don't mark as processed if handler failed
      return NextResponse.json(
        { error: "Event handler failed", details: String(handlerError) },
        { status: 500 }
      )
    }
  } catch (error) {
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    )
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  
  const userId = session.metadata?.userId
  
  if (!userId) {
    throw new Error("Missing userId in session metadata")
  }


  // Verify user exists
  const user = await prisma.users.findUnique({
    where: { id: userId },
  })

  if (!user) {
    throw new Error(`User not found: ${userId}`)
  }

  if (!session.subscription) {
    throw new Error("No subscription in checkout session")
  }

  const subscriptionData = await stripe.subscriptions.retrieve(
    session.subscription as string
  )

    id: subscriptionData.id,
    status: subscriptionData.status,
    customer: subscriptionData.customer,
  })

  // Extract the data from the subscription object with type assertion
  const currentPeriodStart = (subscriptionData as any).current_period_start
  const currentPeriodEnd = (subscriptionData as any).current_period_end

  if (!currentPeriodStart || !currentPeriodEnd) {
    throw new Error("Missing period dates from Stripe subscription")
  }

    start: new Date(currentPeriodStart * 1000).toISOString(),
    end: new Date(currentPeriodEnd * 1000).toISOString(),
  })

  // Use transaction for atomicity
  const result = await prisma.$transaction(async (tx) => {
    return await tx.subscriptions.upsert({
      where: { user_id: userId },
      update: {
        stripe_subscription_id: subscriptionData.id,
        stripe_customer_id: subscriptionData.customer as string,
        stripe_price_id: subscriptionData.items.data[0].price.id,
        stripe_status: subscriptionData.status,
        plan: "pro",
        current_period_start: new Date(currentPeriodStart * 1000),
        current_period_end: new Date(currentPeriodEnd * 1000),
        cancel_at_period_end: subscriptionData.cancel_at_period_end,
        updated_at: new Date(),
      },
      create: {
        id: crypto.randomUUID(),
        user_id: userId,
        stripe_subscription_id: subscriptionData.id,
        stripe_customer_id: subscriptionData.customer as string,
        stripe_price_id: subscriptionData.items.data[0].price.id,
        stripe_status: subscriptionData.status,
        plan: "pro",
        current_period_start: new Date(currentPeriodStart * 1000),
        current_period_end: new Date(currentPeriodEnd * 1000),
        cancel_at_period_end: subscriptionData.cancel_at_period_end,
        created_at: new Date(),
        updated_at: new Date(),
      },
    })
  })

    id: result.id,
    plan: result.plan,
    status: result.stripe_status,
  })
}

async function handleInvoicePaid(invoice: Stripe.Invoice) {
  
  const subscriptionId = (invoice as any).subscription
  
  if (!subscriptionId) {
    return
  }

  const customerId = invoice.customer as string
  
  const existingSubscription = await prisma.subscriptions.findFirst({
    where: { stripe_customer_id: customerId },
  })

  if (!existingSubscription) {
    throw new Error(`Subscription not found for customer: ${customerId}`)
  }


  // Fetch latest subscription data from Stripe
  const stripeSubscription = await stripe.subscriptions.retrieve(
    subscriptionId as string
  )

  const currentPeriodStart = (stripeSubscription as any).current_period_start
  const currentPeriodEnd = (stripeSubscription as any).current_period_end

  const result = await prisma.subscriptions.update({
    where: { id: existingSubscription.id },
    data: {
      stripe_status: "active",
      current_period_start: new Date(currentPeriodStart * 1000),
      current_period_end: new Date(currentPeriodEnd * 1000),
      updated_at: new Date(),
    },
  })

    id: result.id,
    status: result.stripe_status,
    period_end: result.current_period_end,
  })
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  
  const customerId = subscription.customer as string
  
  const existingSubscription = await prisma.subscriptions.findFirst({
    where: { stripe_customer_id: customerId },
  })

  if (!existingSubscription) {
    throw new Error(`Subscription not found for customer: ${customerId}`)
  }


  // Extract the data from the subscription object with type assertion
  const currentPeriodStart = (subscription as any).current_period_start
  const currentPeriodEnd = (subscription as any).current_period_end

  // Determine plan based on status
  let plan = existingSubscription.plan
  if (subscription.status === "active") {
    plan = "pro"
  } else if (subscription.status === "canceled" || subscription.status === "unpaid") {
    plan = "free"
  }

  const result = await prisma.subscriptions.update({
    where: { id: existingSubscription.id },
    data: {
      stripe_status: subscription.status,
      plan: plan,
      current_period_start: new Date(currentPeriodStart * 1000),
      current_period_end: new Date(currentPeriodEnd * 1000),
      cancel_at_period_end: subscription.cancel_at_period_end,
      updated_at: new Date(),
    },
  })

    id: result.id,
    status: result.stripe_status,
    plan: result.plan,
  })
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  
  const customerId = subscription.customer as string
  
  const existingSubscription = await prisma.subscriptions.findFirst({
    where: { stripe_customer_id: customerId },
  })

  if (!existingSubscription) {
    throw new Error(`Subscription not found for customer: ${customerId}`)
  }


  const result = await prisma.subscriptions.update({
    where: { id: existingSubscription.id },
    data: {
      stripe_status: "canceled",
      plan: "free",
      updated_at: new Date(),
    },
  })

    id: result.id,
    plan: result.plan,
  })
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  
  const customerId = invoice.customer as string
  
  const existingSubscription = await prisma.subscriptions.findFirst({
    where: { stripe_customer_id: customerId },
  })

  if (!existingSubscription) {
    throw new Error(`Subscription not found for customer: ${customerId}`)
  }


  const result = await prisma.subscriptions.update({
    where: { id: existingSubscription.id },
    data: {
      stripe_status: "past_due",
      updated_at: new Date(),
    },
  })

    id: result.id,
    status: result.stripe_status,
  })

  // TODO: Send email notification to user about payment failure
}
