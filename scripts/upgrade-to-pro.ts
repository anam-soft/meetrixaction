/**
 * Quick script to manually upgrade a user to Pro in the database
 * Run this with: npx ts-node scripts/upgrade-to-pro.ts YOUR_USER_EMAIL
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function upgradeUserToPro(userEmail: string) {
  try {
    
    const user = await prisma.users.findUnique({
      where: { email: userEmail }
    })

    if (!user) {
      process.exit(1)
    }


    // Create or update subscription
    const subscription = await prisma.subscriptions.upsert({
      where: { user_id: user.id },
      update: {
        stripe_status: 'active',
        plan: 'pro',
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
        stripe_price_id: 'price_test_mock',
        stripe_status: 'active',
        plan: 'pro',
        current_period_start: new Date(),
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        cancel_at_period_end: false,
        created_at: new Date(),
        updated_at: new Date(),
      },
    })

  } catch (error) {
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Get email from command line
const userEmail = process.argv[2]

if (!userEmail) {
  process.exit(1)
}

upgradeUserToPro(userEmail)
