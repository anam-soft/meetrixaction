import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth-utils"
import { prisma } from "@/lib/prisma"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-04-22.dahlia",
})

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get local subscription
    const localSubscription = await prisma.subscriptions.findUnique({
      where: { user_id: user.id },
    })

    // Search for Stripe customer by email
    let stripeCustomer = null
    let stripeSubscriptions: any[] = []
    let allStripeCustomers: any[] = []
    
    if (user.email) {
      const customers = await stripe.customers.list({
        email: user.email,
        limit: 10,
      })
      
      allStripeCustomers = customers.data.map(c => ({
        id: c.id,
        email: c.email,
        created: new Date(c.created * 1000).toISOString(),
      }))
      
      if (customers.data.length > 0) {
        stripeCustomer = customers.data[0]
        
        // Get all subscriptions for this customer (including inactive)
        const subs = await stripe.subscriptions.list({
          customer: stripeCustomer.id,
          limit: 10,
          expand: ['data.items.data.price'],
        })
        
        stripeSubscriptions = await Promise.all(subs.data.map(async (sub) => {
          // Retrieve full subscription to get all fields
          const fullSub = await stripe.subscriptions.retrieve(sub.id)
          const periodStart = (fullSub as any).current_period_start
          const periodEnd = (fullSub as any).current_period_end
          
          return {
            id: fullSub.id,
            status: fullSub.status,
            created: new Date(fullSub.created * 1000).toISOString(),
            current_period_start: periodStart ? new Date(periodStart * 1000).toISOString() : 'N/A',
            current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : 'N/A',
            cancel_at_period_end: fullSub.cancel_at_period_end,
            canceled_at: fullSub.canceled_at ? new Date(fullSub.canceled_at * 1000).toISOString() : null,
            items: fullSub.items.data.map(item => ({
              price_id: item.price.id,
              product: item.price.product,
              amount: item.price.unit_amount,
              currency: item.price.currency,
            })),
          }
        }))
      }
    }

    // Get recent checkout sessions
    let recentCheckoutSessions: any[] = []
    try {
      const sessions = await stripe.checkout.sessions.list({
        limit: 10,
      })
      
      recentCheckoutSessions = sessions.data
        .filter(s => s.customer_email === user.email || s.customer_details?.email === user.email)
        .map(s => ({
          id: s.id,
          status: s.status,
          payment_status: s.payment_status,
          customer: s.customer,
          subscription: s.subscription,
          created: new Date(s.created * 1000).toISOString(),
          metadata: s.metadata,
        }))
    } catch (error) {
    }

    // Get recent payment intents
    let recentPayments: any[] = []
    try {
      const payments = await stripe.paymentIntents.list({
        limit: 10,
      })
      
      recentPayments = payments.data
        .filter(p => p.receipt_email === user.email)
        .map(p => ({
          id: p.id,
          status: p.status,
          amount: p.amount,
          currency: p.currency,
          created: new Date(p.created * 1000).toISOString(),
        }))
    } catch (error) {
    }

    const hasActiveSubscription = stripeSubscriptions.some(s => s.status === 'active')
    const hasAnySubscription = stripeSubscriptions.length > 0
    const hasCompletedPayment = recentCheckoutSessions.some(s => s.payment_status === 'paid')

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        clerk_id: user.clerk_id,
      },
      localSubscription: localSubscription ? {
        id: localSubscription.id,
        plan: localSubscription.plan,
        stripe_status: localSubscription.stripe_status,
        stripe_subscription_id: localSubscription.stripe_subscription_id,
        stripe_customer_id: localSubscription.stripe_customer_id,
        current_period_start: localSubscription.current_period_start,
        current_period_end: localSubscription.current_period_end,
      } : null,
      stripeCustomer: stripeCustomer ? {
        id: stripeCustomer.id,
        email: stripeCustomer.email,
        created: new Date(stripeCustomer.created * 1000).toISOString(),
      } : null,
      allStripeCustomers,
      stripeSubscriptions,
      recentCheckoutSessions,
      recentPayments,
      diagnosis: {
        hasLocalSubscription: !!localSubscription,
        localSubscriptionActive: localSubscription?.stripe_status === 'active',
        hasStripeCustomer: !!stripeCustomer,
        hasActiveStripeSubscription: hasActiveSubscription,
        hasAnyStripeSubscription: hasAnySubscription,
        hasCompletedPayment: hasCompletedPayment,
        issue: !localSubscription && hasActiveSubscription
          ? "✅ FIXABLE: Active subscription exists in Stripe but not in local database - Use sync button"
          : !localSubscription && hasCompletedPayment && !hasAnySubscription
          ? "⚠️ PAYMENT COMPLETED BUT NO SUBSCRIPTION: Check Stripe dashboard for the checkout session and subscription creation"
          : !localSubscription && !hasActiveSubscription && hasAnySubscription
          ? "⚠️ SUBSCRIPTION EXISTS BUT NOT ACTIVE: Status is " + stripeSubscriptions[0]?.status
          : localSubscription && localSubscription.stripe_status !== 'active'
          ? "⚠️ LOCAL SUBSCRIPTION NOT ACTIVE: Status is " + localSubscription.stripe_status
          : !stripeCustomer
          ? "❌ NO STRIPE CUSTOMER: No customer found with email " + user.email
          : !hasAnySubscription && !hasCompletedPayment
          ? "❌ NO SUBSCRIPTION OR PAYMENT: No subscription or completed payment found in Stripe"
          : hasActiveSubscription && localSubscription?.stripe_status === 'active'
          ? "✅ EVERYTHING LOOKS GOOD: Subscription is active in both Stripe and local database"
          : "⚠️ UNKNOWN ISSUE: Check the details below",
        recommendation: !localSubscription && hasActiveSubscription
          ? "Click the 'Sync Subscription' button to fix this"
          : !hasCompletedPayment
          ? "Complete the payment in Stripe first. Go to Dashboard → Billing → Upgrade to Pro"
          : hasCompletedPayment && !hasAnySubscription
          ? "Payment completed but subscription wasn't created. Contact support with your checkout session ID"
          : hasAnySubscription && !hasActiveSubscription
          ? "Subscription exists but is " + stripeSubscriptions[0]?.status + ". Check Stripe dashboard or contact support"
          : "Use the information below to diagnose the issue or contact support",
      }
    })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to debug subscription", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
