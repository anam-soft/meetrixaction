import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-04-22.dahlia",
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get("stripe-signature")!

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error("Webhook signature verification failed:", err)
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
    }

    // Handle the event
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session
        await handleCheckoutCompleted(session)
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
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    )
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId
  
  if (!userId) {
    console.error("No userId in session metadata")
    return
  }

  const subscriptionData = await stripe.subscriptions.retrieve(
    session.subscription as string
  )

  // Extract the data from the subscription object with type assertion
  const currentPeriodStart = (subscriptionData as any).current_period_start
  const currentPeriodEnd = (subscriptionData as any).current_period_end

  await prisma.subscriptions.upsert({
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
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string
  
  const existingSubscription = await prisma.subscriptions.findFirst({
    where: { stripe_customer_id: customerId },
  })

  if (!existingSubscription) {
    console.error("Subscription not found for customer:", customerId)
    return
  }

  // Extract the data from the subscription object with type assertion
  const currentPeriodStart = (subscription as any).current_period_start
  const currentPeriodEnd = (subscription as any).current_period_end

  await prisma.subscriptions.update({
    where: { id: existingSubscription.id },
    data: {
      stripe_status: subscription.status,
      current_period_start: new Date(currentPeriodStart * 1000),
      current_period_end: new Date(currentPeriodEnd * 1000),
      cancel_at_period_end: subscription.cancel_at_period_end,
      updated_at: new Date(),
    },
  })
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string
  
  const existingSubscription = await prisma.subscriptions.findFirst({
    where: { stripe_customer_id: customerId },
  })

  if (!existingSubscription) {
    console.error("Subscription not found for customer:", customerId)
    return
  }

  await prisma.subscriptions.update({
    where: { id: existingSubscription.id },
    data: {
      stripe_status: "canceled",
      plan: "free",
      updated_at: new Date(),
    },
  })
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string
  
  const existingSubscription = await prisma.subscriptions.findFirst({
    where: { stripe_customer_id: customerId },
  })

  if (!existingSubscription) {
    console.error("Subscription not found for customer:", customerId)
    return
  }

  await prisma.subscriptions.update({
    where: { id: existingSubscription.id },
    data: {
      stripe_status: "past_due",
      updated_at: new Date(),
    },
  })
}
