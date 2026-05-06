"use client"

import { useEffect, useState } from "react"
import DashboardLayout from "@/components/DashboardLayout"
import {
  CreditCard,
  Check,
  Zap,
  Crown,
  Calendar,
  AlertCircle,
  ExternalLink,
  Loader2,
} from "lucide-react"

interface Usage {
  canUpload: boolean
  currentUsage: number
  limit: number
  isPro: boolean
}

interface Subscription {
  id: string
  stripe_customer_id: string
  stripe_subscription_id: string
  stripe_price_id: string
  current_period_end: string
  current_period_start: string
  cancel_at_period_end: boolean
  stripe_status: string
  plan: string
}

export default function BillingPage() {
  const [usage, setUsage] = useState<Usage | null>(null)
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [upgrading, setUpgrading] = useState(false)
  const [managingBilling, setManagingBilling] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      console.log("🔄 Fetching usage and subscription data...")
      
      // Fetch usage first (this will auto-sync from Stripe if needed)
      const usageRes = await fetch("/api/usage")
      const usageData = await usageRes.json()
      console.log("Usage data:", usageData)
      setUsage(usageData)

      // Always fetch subscription to get latest status
      const subRes = await fetch("/api/subscription")
      const subData = await subRes.json()
      console.log("Subscription data:", subData)
      
      if (subData.subscription) {
        setSubscription(subData.subscription)
        
        // If subscription is active but usage says not pro, refresh
        if (subData.subscription.stripe_status === 'active' && !usageData.isPro) {
          console.log("⚠️ Subscription active but usage not updated, refreshing...")
          setTimeout(() => window.location.reload(), 1000)
        }
      }
    } catch (error) {
      console.error("Failed to fetch data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpgrade = async () => {
    setUpgrading(true)
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          priceId:
            process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID ||
            "price_1TSveBRuoH55oHIo89qWZ8js",
        }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      alert("Failed to start upgrade process")
    } finally {
      setUpgrading(false)
    }
  }

  const handleManageBilling = async () => {
    setManagingBilling(true)
    try {
      // Create Stripe billing portal session
      const res = await fetch("/api/stripe/portal", {
        method: "POST",
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      alert("Failed to open billing portal")
    } finally {
      setManagingBilling(false)
    }
  }

  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      description: "Perfect for trying out the platform",
      features: [
        "5 meetings per month",
        "AI-powered transcription",
        "Action item extraction",
        "Basic analytics",
        "Email support",
      ],
      limitations: [
        "Limited to 5 meetings/month",
        "Basic features only",
        "Standard support",
      ],
      current: !usage?.isPro,
    },
    {
      name: "Pro",
      price: "$29",
      period: "per month",
      description: "For professionals who need unlimited access",
      features: [
        "Unlimited meetings",
        "AI-powered transcription",
        "Action item extraction",
        "Advanced analytics",
        "Priority support",
        "Custom integrations",
        "Team collaboration (coming soon)",
        "API access (coming soon)",
      ],
      limitations: [],
      current: usage?.isPro || false,
      popular: true,
    },
  ]

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading billing info...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold gradient-text mb-2">
            Usage & Billing
          </h1>
          <p className="text-muted-foreground">
            Manage your subscription and monitor usage
          </p>
        </div>

        {/* Current Plan */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              {usage?.isPro ? (
                <div className="p-3 rounded-lg bg-gradient-to-br from-purple-600/20 to-pink-600/20">
                  <Crown className="w-6 h-6 text-purple-400" />
                </div>
              ) : (
                <div className="p-3 rounded-lg bg-blue-500/20">
                  <Zap className="w-6 h-6 text-blue-400" />
                </div>
              )}
              <div>
                <h2 className="text-2xl font-bold">
                  {usage?.isPro ? "Pro Plan" : "Free Plan"}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {usage?.isPro
                    ? "Unlimited meetings and advanced features"
                    : "Limited to 5 meetings per month"}
                </p>
              </div>
            </div>
            {usage?.isPro && subscription && (
              <button
                onClick={handleManageBilling}
                disabled={managingBilling}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg font-semibold transition-colors flex items-center gap-2"
              >
                {managingBilling ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CreditCard className="w-4 h-4" />
                )}
                Manage Billing
              </button>
            )}
          </div>

          {/* Usage Meter */}
          {!usage?.isPro && usage && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Monthly Usage</span>
                <span className="text-sm text-muted-foreground">
                  {usage.currentUsage} / {usage.limit} meetings
                </span>
              </div>
              <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    usage.currentUsage >= usage.limit
                      ? "bg-red-500"
                      : usage.currentUsage / usage.limit > 0.8
                      ? "bg-yellow-500"
                      : "bg-gradient-to-r from-purple-600 to-pink-600"
                  }`}
                  style={{
                    width: `${Math.min(
                      (usage.currentUsage / usage.limit) * 100,
                      100
                    )}%`,
                  }}
                />
              </div>
              {!usage.canUpload && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30 mt-4">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-400">
                      Monthly Limit Reached
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      You've used all {usage.limit} meetings this month. Upgrade
                      to Pro for unlimited access.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Subscription Info */}
          {usage?.isPro && subscription && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-white/5">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">Billing Period</span>
                </div>
                <p className="font-semibold">
                  {new Date(
                    subscription.current_period_start
                  ).toLocaleDateString()}{" "}
                  -{" "}
                  {new Date(
                    subscription.current_period_end
                  ).toLocaleDateString()}
                </p>
              </div>

              <div className="p-4 rounded-lg bg-white/5">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <CreditCard className="w-4 h-4" />
                  <span className="text-sm">Status</span>
                </div>
                <p className="font-semibold capitalize">
                  {subscription.stripe_status}
                </p>
              </div>

              <div className="p-4 rounded-lg bg-white/5">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Zap className="w-4 h-4" />
                  <span className="text-sm">Next Billing</span>
                </div>
                <p className="font-semibold">
                  {subscription.cancel_at_period_end
                    ? "Cancelled"
                    : new Date(
                        subscription.current_period_end
                      ).toLocaleDateString()}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Plans */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Available Plans</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`glass-card p-6 relative ${
                  plan.popular
                    ? "border-purple-500/50 bg-gradient-to-br from-purple-600/5 to-pink-600/5"
                    : ""
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="px-4 py-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full text-xs font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}

                {plan.current && (
                  <div className="absolute top-4 right-4">
                    <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-semibold border border-green-500/30">
                      Current Plan
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-4xl font-bold gradient-text">
                      {plan.price}
                    </span>
                    <span className="text-muted-foreground">
                      {plan.period}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {plan.description}
                  </p>
                </div>

                <div className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                {!plan.current && plan.name === "Pro" && (
                  <button
                    onClick={handleUpgrade}
                    disabled={upgrading}
                    className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-semibold hover:shadow-lg transition-shadow flex items-center justify-center gap-2"
                  >
                    {upgrading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Crown className="w-5 h-5" />
                        Upgrade to Pro
                      </>
                    )}
                  </button>
                )}

                {plan.current && plan.name === "Free" && (
                  <button
                    onClick={handleUpgrade}
                    disabled={upgrading}
                    className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-semibold hover:shadow-lg transition-shadow flex items-center justify-center gap-2"
                  >
                    {upgrading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Crown className="w-5 h-5" />
                        Upgrade Now
                      </>
                    )}
                  </button>
                )}

                {plan.current && plan.name === "Pro" && (
                  <div className="text-center p-3 rounded-lg bg-green-500/10 border border-green-500/30">
                    <p className="text-sm text-green-400 font-medium">
                      You're on the Pro plan!
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="glass-card p-6">
          <h2 className="text-2xl font-bold mb-4">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">
                Can I cancel my subscription anytime?
              </h3>
              <p className="text-sm text-muted-foreground">
                Yes, you can cancel your Pro subscription at any time. You'll
                continue to have access until the end of your billing period.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">
                What happens when I reach my free plan limit?
              </h3>
              <p className="text-sm text-muted-foreground">
                Once you've used all 5 meetings in your free plan, you won't be
                able to upload new meetings until the next month or until you
                upgrade to Pro.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">
                How does billing work for the Pro plan?
              </h3>
              <p className="text-sm text-muted-foreground">
                Pro plan is billed monthly at $29/month. You'll be charged
                automatically each month until you cancel. All payments are
                processed securely through Stripe.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">
                Can I get a refund if I'm not satisfied?
              </h3>
              <p className="text-sm text-muted-foreground">
                We offer a 14-day money-back guarantee. If you're not satisfied
                with the Pro plan, contact our support team within 14 days of
                your purchase for a full refund.
              </p>
            </div>
          </div>
        </div>

        {/* Support */}
        <div className="glass-card p-6 bg-gradient-to-br from-purple-600/10 to-pink-600/10 border-purple-500/30">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-purple-500/20">
              <CreditCard className="w-6 h-6 text-purple-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-2">
                Need help with billing?
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Our support team is here to help with any billing questions or
                issues you may have.
              </p>
              <a
                href="mailto:support@meetrixaction.com"
                className="inline-flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300 font-medium"
              >
                Contact Support
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
