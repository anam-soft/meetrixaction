/**
 * Quick script to manually upgrade a user to Pro in the database
 * Run this with: npx ts-node scripts/upgrade-to-pro.ts YOUR_USER_EMAIL
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function upgradeUserToPro(userEmail: string) {
  try {
    console.log('🔍 Finding user:', userEmail)
    
    const user = await prisma.users.findUnique({
      where: { email: userEmail }
    })

    if (!user) {
      console.error('❌ User not found:', userEmail)
      process.exit(1)
    }

    console.log('✅ Found user:', user.id, user.name)

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

    console.log('✅ User upgraded to Pro!')
    console.log('📋 Subscription details:')
    console.log('  - ID:', subscription.id)
    console.log('  - Plan:', subscription.plan)
    console.log('  - Status:', subscription.stripe_status)
    console.log('  - Period ends:', subscription.current_period_end)
    console.log('\n🎉 Done! Refresh your browser to see Pro plan.')
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Get email from command line
const userEmail = process.argv[2]

if (!userEmail) {
  console.error('Usage: npx ts-node scripts/upgrade-to-pro.ts YOUR_EMAIL')
  process.exit(1)
}

upgradeUserToPro(userEmail)
