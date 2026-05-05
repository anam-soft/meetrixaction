import { prisma } from "./prisma"
import { format } from "date-fns"
import { syncSubscriptionFromStripe } from "./stripe-utils"

const FREE_MEETINGS_LIMIT = parseInt(process.env.FREE_MEETINGS_PER_MONTH || "5")

export async function checkUsageLimit(userId: string): Promise<{
  canUpload: boolean
  currentUsage: number
  limit: number
  isPro: boolean
}> {
  // Check if user has Pro subscription
  let subscription = await prisma.subscriptions.findUnique({
    where: { user_id: userId },
  })

  // Always try to sync from Stripe if not active locally
  // This ensures we catch any payments that completed but webhooks failed
  if (!subscription || subscription.stripe_status !== "active") {
    console.log("🔄 No active local subscription, syncing from Stripe for user:", userId)
    subscription = await syncSubscriptionFromStripe(userId)
    
    if (subscription) {
      console.log("✅ Successfully synced subscription:", subscription.plan, subscription.stripe_status)
    } else {
      console.log("ℹ️ No active subscription found in Stripe")
    }
  }

  const isPro = subscription?.plan === "pro" && subscription?.stripe_status === "active"

  // Pro users have unlimited uploads
  if (isPro) {
    return {
      canUpload: true,
      currentUsage: 0,
      limit: -1, // -1 means unlimited
      isPro: true,
    }
  }

  // Check current month usage for free users
  const currentMonth = format(new Date(), "yyyy-MM")
  
  let usageRecord = await prisma.usage_records.findUnique({
    where: {
      user_id_month: {
        user_id: userId,
        month: currentMonth,
      },
    },
  })

  // Create usage record if it doesn't exist
  if (!usageRecord) {
    usageRecord = await prisma.usage_records.create({
      data: {
        id: crypto.randomUUID(),
        user_id: userId,
        month: currentMonth,
        meetings_created: 0,
        ai_processed: 0,
        created_at: new Date(),
        updated_at: new Date(),
      },
    })
  }

  const currentUsage = usageRecord.meetings_created
  const canUpload = currentUsage < FREE_MEETINGS_LIMIT

  return {
    canUpload,
    currentUsage,
    limit: FREE_MEETINGS_LIMIT,
    isPro: false,
  }
}

export async function incrementUsage(userId: string) {
  const currentMonth = format(new Date(), "yyyy-MM")
  
  await prisma.usage_records.upsert({
    where: {
      user_id_month: {
        user_id: userId,
        month: currentMonth,
      },
    },
    update: {
      meetings_created: {
        increment: 1,
      },
      updated_at: new Date(),
    },
    create: {
      id: crypto.randomUUID(),
      user_id: userId,
      month: currentMonth,
      meetings_created: 1,
      ai_processed: 0,
      created_at: new Date(),
      updated_at: new Date(),
    },
  })
}

export async function incrementAIProcessed(userId: string) {
  const currentMonth = format(new Date(), "yyyy-MM")
  
  await prisma.usage_records.upsert({
    where: {
      user_id_month: {
        user_id: userId,
        month: currentMonth,
      },
    },
    update: {
      ai_processed: {
        increment: 1,
      },
      updated_at: new Date(),
    },
    create: {
      id: crypto.randomUUID(),
      user_id: userId,
      month: currentMonth,
      meetings_created: 0,
      ai_processed: 1,
      created_at: new Date(),
      updated_at: new Date(),
    },
  })
}
