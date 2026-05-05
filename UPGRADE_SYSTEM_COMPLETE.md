# 💰 Free → Pro Upgrade System - Complete Implementation

## ✅ Implementation Status: PRODUCTION READY

This document describes the complete, production-level upgrade system that converts free users into paying Pro customers.

---

## 🎯 Core Principle

> **"Upgrade should feel like removing a blocker, not buying a product."**

The system is designed to create upgrade intent at the right moment and provide a frictionless payment flow that instantly unlocks value.

---

## 📊 User States

### 1. **FREE User**
- Plan: `FREE`
- Limit: 5 meetings/month
- Sees upgrade prompts at strategic moments
- Usage resets monthly

### 2. **PRO User**
- Plan: `PRO`
- Unlimited meetings
- No restrictions
- Priority support

### 3. **PAST_DUE User**
- Payment failed
- Temporary restrictions
- Receives payment retry notifications

---

## 🚦 Upgrade Trigger Points

### 1. **Hard Limit (Primary Trigger)** ✅
- **When**: User tries to upload 6th meeting
- **Action**: Show blocking modal ([`UpgradeLimitModal`](components/UpgradeLimitModal.tsx))
- **UX**: Cannot proceed without upgrading
- **Location**: [`app/dashboard/meetings/page.tsx`](app/dashboard/meetings/page.tsx)

### 2. **Soft Warning (4/5 meetings)** ✅
- **When**: User has used 4 out of 5 meetings
- **Action**: Show dismissible banner ([`UpgradeBanner`](components/UpgradeBanner.tsx))
- **UX**: Warning with upgrade CTA
- **Location**: [`app/dashboard/page.tsx`](app/dashboard/page.tsx)

### 3. **Passive Upsell** ✅
- **Where**: Dashboard, Pricing page
- **Action**: Always-visible upgrade CTAs
- **UX**: Non-intrusive promotion

---

## 🎨 UX Flow (Step-by-Step)

### Step 1: Limit Reached
```
User uploads 6th meeting
  ↓
API returns 403 with usage info
  ↓
Frontend shows UpgradeLimitModal
  ↓
User clicks "Upgrade to Pro"
```

### Step 2: Checkout Redirect
```
Modal calls /api/stripe/checkout
  ↓
Creates Stripe Checkout Session
  ↓
Redirects to Stripe hosted page
```

### Step 3: Payment
```
User enters payment details on Stripe
  ↓
Stripe processes payment
  ↓
Stripe redirects to success URL
```

### Step 4: Success & Unlock
```
User lands on /dashboard?success=true
  ↓
Dashboard shows UpgradeSuccessToast
  ↓
Calls /api/subscription/sync
  ↓
Features unlocked immediately
```

---

## ⚙️ Backend Flow

### 1. **Create Stripe Customer** ✅
**File**: [`app/api/stripe/checkout/route.ts`](app/api/stripe/checkout/route.ts)

```typescript
// Check if customer exists, create if not
if (!customerId) {
  const customer = await stripe.customers.create({
    email: user.email,
    metadata: { userId: user.id }
  })
}
```

### 2. **Create Checkout Session** ✅
```typescript
const session = await stripe.checkout.sessions.create({
  customer: customerId,
  mode: "subscription",
  line_items: [{ price: priceId, quantity: 1 }],
  success_url: `${APP_URL}/dashboard?success=true`,
  cancel_url: `${APP_URL}/dashboard?canceled=true`,
  metadata: { userId: user.id }
})
```

### 3. **Webhook Processing** ✅
**File**: [`app/api/webhooks/stripe/route.ts`](app/api/webhooks/stripe/route.ts)

#### Events Handled:

**✅ `checkout.session.completed`**
- Creates/updates subscription record
- Sets plan to PRO
- Sets status to active

**✅ `invoice.paid`**
- Extends subscription period
- Confirms active status

**✅ `customer.subscription.updated`**
- Updates subscription status
- Handles plan changes

**✅ `customer.subscription.deleted`**
- Downgrades to FREE
- Sets status to canceled

**✅ `invoice.payment_failed`**
- Sets status to past_due
- Triggers retry logic

---

## 🗄️ Database Schema

**Table**: `subscriptions`

```prisma
model subscriptions {
  id                     String   @id
  user_id                String   @unique
  stripe_customer_id     String
  stripe_subscription_id String   @unique
  stripe_price_id        String
  stripe_status          String   // active, past_due, canceled
  plan                   String   // free, pro
  current_period_start   DateTime
  current_period_end     DateTime
  cancel_at_period_end   Boolean
  created_at             DateTime
  updated_at             DateTime
}
```

---

## 🔒 Access Control Logic

**File**: [`lib/usage.ts`](lib/usage.ts)

```typescript
// Check if user can upload
if (plan === "PRO" && status === "active") {
  return { canUpload: true, limit: -1 } // Unlimited
}

// Free users
if (meetings_count >= 5) {
  return { canUpload: false, limit: 5 }
}
```

**Enforcement**: [`app/api/meetings/route.ts`](app/api/meetings/route.ts)

```typescript
const usage = await checkUsageLimit(user.id)

if (!usage.canUpload) {
  return NextResponse.json(
    { error: "Usage limit reached" },
    { status: 403 }
  )
}
```

---

## 🔁 Real-Time Sync

**File**: [`app/api/subscription/sync/route.ts`](app/api/subscription/sync/route.ts)

After successful payment:
1. Frontend calls `/api/subscription/sync`
2. Backend fetches latest data from Stripe
3. Updates local database
4. Returns updated subscription status
5. UI refetches usage limits
6. Features unlock instantly

---

## ⚠️ Edge Cases Handled

### ✅ 1. Duplicate Webhooks
- **Solution**: Event ID tracking with in-memory cache
- **Implementation**: `processedEvents` Map with 1-hour TTL

### ✅ 2. Payment Success but No Webhook
- **Solution**: Manual sync on success redirect
- **Implementation**: Dashboard calls `/api/subscription/sync`

### ✅ 3. User Refreshes During Payment
- **Solution**: Idempotent webhook handlers
- **Implementation**: Database upsert operations

### ✅ 4. Subscription Cancellation
- **Solution**: Remains PRO until period ends
- **Implementation**: `cancel_at_period_end` flag

### ✅ 5. Payment Failure
- **Solution**: Status set to `past_due`, user notified
- **Implementation**: `invoice.payment_failed` webhook

### ✅ 6. Race Conditions
- **Solution**: Database transactions
- **Implementation**: Prisma `$transaction`

---

## 🎨 UI Components

### 1. **UpgradeLimitModal** ✅
**File**: [`components/UpgradeLimitModal.tsx`](components/UpgradeLimitModal.tsx)
- Blocking modal when limit reached
- Shows features & pricing
- Direct upgrade CTA

### 2. **UpgradeBanner** ✅
**File**: [`components/UpgradeBanner.tsx`](components/UpgradeBanner.tsx)
- Warning banner at 4/5 meetings
- Dismissible
- Upgrade CTA

### 3. **UpgradeSuccessToast** ✅
**File**: [`components/UpgradeSuccessToast.tsx`](components/UpgradeSuccessToast.tsx)
- Success notification after payment
- Auto-dismisses after 5 seconds
- Confirms Pro status

### 4. **Pricing Page** ✅
**File**: [`app/pricing/page.tsx`](app/pricing/page.tsx)
- Clear Free vs Pro comparison
- FAQ section
- Multiple CTAs

---

## 📊 Metrics to Track

### Conversion Funnel
1. **Users hitting limit** → Track in analytics
2. **Modal shown** → Track modal open
3. **Upgrade clicked** → Track checkout initiation
4. **Checkout completed** → Track via webhook
5. **Payment success** → Track subscription creation

### Key Metrics
- Conversion rate (limit → upgrade)
- Checkout completion rate
- Monthly Recurring Revenue (MRR)
- Churn rate
- Average revenue per user (ARPU)

---

## 🛡️ Security Features

### ✅ Webhook Signature Verification
```typescript
event = stripe.webhooks.constructEvent(
  body,
  signature,
  webhookSecret
)
```

### ✅ Never Trust Frontend
- All plan checks happen server-side
- Subscription status stored in database
- Usage limits enforced in API

### ✅ User Verification
- All API routes check authentication
- User ID from session, not request body
- Metadata validation in webhooks

---

## 🚀 Deployment Checklist

### Environment Variables Required:
```bash
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PRICE_ID=price_...
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### Stripe Setup:
1. ✅ Create Product in Stripe Dashboard
2. ✅ Create Price (monthly subscription)
3. ✅ Configure Webhook endpoint: `/api/webhooks/stripe`
4. ✅ Enable events:
   - `checkout.session.completed`
   - `invoice.paid`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`

### Testing:
1. ✅ Test free user flow
2. ✅ Test limit enforcement
3. ✅ Test upgrade modal
4. ✅ Test Stripe checkout (test mode)
5. ✅ Test webhook delivery
6. ✅ Test success redirect
7. ✅ Test feature unlock
8. ✅ Test cancellation flow

---

## 📝 API Endpoints

### User-Facing:
- `POST /api/stripe/checkout` - Create checkout session
- `POST /api/stripe/portal` - Access billing portal
- `GET /api/usage` - Get current usage
- `POST /api/subscription/sync` - Manual sync from Stripe

### Webhooks:
- `POST /api/webhooks/stripe` - Stripe webhook handler

---

## 🎯 Success Criteria

The upgrade system is successful when:

1. ✅ **Fast**: ≤ 2 clicks from limit to checkout
2. ✅ **Clear**: User understands what they're getting
3. ✅ **Instant**: Features unlock within seconds
4. ✅ **Reliable**: Webhooks process correctly
5. ✅ **Secure**: All payments verified server-side
6. ✅ **Recoverable**: Handles failures gracefully

---

## 🔧 Troubleshooting

### Issue: Subscription not updating after payment
**Solution**: Check webhook delivery in Stripe Dashboard

### Issue: User still sees limit after upgrading
**Solution**: Call `/api/subscription/sync` manually

### Issue: Duplicate subscriptions
**Solution**: Check idempotency in webhook handler

### Issue: Payment succeeded but user not upgraded
**Solution**: Verify `userId` in checkout session metadata

---

## 📚 Related Files

### Core Implementation:
- [`lib/usage.ts`](lib/usage.ts) - Usage limit logic
- [`lib/stripe-utils.ts`](lib/stripe-utils.ts) - Stripe sync utilities
- [`app/api/stripe/checkout/route.ts`](app/api/stripe/checkout/route.ts) - Checkout creation
- [`app/api/webhooks/stripe/route.ts`](app/api/webhooks/stripe/route.ts) - Webhook handler
- [`app/api/subscription/sync/route.ts`](app/api/subscription/sync/route.ts) - Manual sync

### UI Components:
- [`components/UpgradeLimitModal.tsx`](components/UpgradeLimitModal.tsx)
- [`components/UpgradeBanner.tsx`](components/UpgradeBanner.tsx)
- [`components/UpgradeSuccessToast.tsx`](components/UpgradeSuccessToast.tsx)

### Pages:
- [`app/dashboard/page.tsx`](app/dashboard/page.tsx) - Main dashboard with upgrade triggers
- [`app/dashboard/meetings/page.tsx`](app/dashboard/meetings/page.tsx) - Meetings with limit modal
- [`app/pricing/page.tsx`](app/pricing/page.tsx) - Pricing page

---

## ✅ Implementation Complete

All components of the Free → Pro upgrade system are implemented and production-ready:

- ✅ Usage limit enforcement
- ✅ Upgrade UI components
- ✅ Stripe checkout integration
- ✅ Webhook processing
- ✅ Real-time sync
- ✅ Success handling
- ✅ Edge case handling
- ✅ Security measures
- ✅ Idempotent operations

**The system is ready for production deployment.**
