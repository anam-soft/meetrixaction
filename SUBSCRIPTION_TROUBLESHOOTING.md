# Subscription Troubleshooting Guide

## Issue: Paid for upgrade but still showing Free Plan

This guide will help you diagnose and fix subscription sync issues.

---

## Quick Fix (For Users)

### Option 1: Use the Sync Button (Recommended)
1. Go to **Dashboard → Billing**
2. You'll see a yellow warning box at the top if you're on the Free plan
3. Click the **"Sync Subscription"** button
4. Wait for the sync to complete
5. The page will refresh automatically if successful

### Option 2: Use Debug Info
1. Go to **Dashboard → Billing**
2. Click the **"Debug Info"** button in the yellow warning box
3. Check the diagnosis message
4. Look for active subscriptions in Stripe
5. If you see an active subscription in Stripe but not locally, use the Sync button

---

## Common Causes

### 1. Webhook Delivery Failed
**Symptoms:**
- Payment completed in Stripe
- No subscription record in database
- Stripe shows active subscription

**Solution:**
- Use the "Sync Subscription" button on the billing page
- This manually fetches the subscription from Stripe

### 2. Webhook Not Configured
**Symptoms:**
- Webhooks never fire
- No logs in Stripe dashboard

**Solution:**
1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://your-domain.com/api/webhooks/stripe`
3. Select events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
4. Copy the webhook signing secret
5. Update `STRIPE_WEBHOOK_SECRET` in your `.env` file

### 3. Wrong User ID in Metadata
**Symptoms:**
- Webhook fires but fails to update subscription
- Error in logs: "No userId in session metadata"

**Solution:**
- Check that the checkout session includes the correct user ID in metadata
- This is handled automatically in `/api/stripe/checkout/route.ts`

---

## Debugging Steps

### Step 1: Check Debug Endpoint
```bash
# Make sure you're logged in, then visit:
https://your-domain.com/api/debug/subscription
```

This will show:
- Your user info
- Local subscription status
- Stripe customer info
- All Stripe subscriptions
- Diagnosis of the issue

### Step 2: Check Stripe Dashboard
1. Go to Stripe Dashboard → Customers
2. Search for your email
3. Check if there's an active subscription
4. Note the subscription ID and status

### Step 3: Check Database
```sql
-- Check subscriptions table
SELECT * FROM subscriptions WHERE user_id = 'your-user-id';

-- Check if user exists
SELECT id, email FROM users WHERE email = 'your-email';
```

### Step 4: Check Webhook Logs
1. Go to Stripe Dashboard → Developers → Webhooks
2. Click on your webhook endpoint
3. Check recent events
4. Look for failed deliveries or errors

### Step 5: Check Application Logs
Look for these log messages:
- `🔔 Stripe webhook received`
- `✅ Webhook signature verified`
- `💳 Processing checkout.session.completed`
- `✅ Subscription saved to database`

---

## API Endpoints

### 1. Get Subscription Status
```
GET /api/subscription
```
Returns the current user's subscription from the database.

### 2. Sync Subscription from Stripe
```
POST /api/subscription/sync
```
Manually syncs the subscription from Stripe to the local database.

### 3. Debug Subscription
```
GET /api/debug/subscription
```
Returns detailed debug information about subscription status.

### 4. Stripe Webhook
```
POST /api/webhooks/stripe
```
Receives webhook events from Stripe (configured in Stripe Dashboard).

---

## How Subscription Sync Works

### Automatic Sync (via Webhooks)
1. User completes payment in Stripe
2. Stripe sends `checkout.session.completed` webhook
3. Webhook handler retrieves subscription details
4. Subscription is saved to database with `plan: "pro"` and `status: "active"`

### Manual Sync (via Sync Button)
1. User clicks "Sync Subscription" button
2. System searches for Stripe customer by email
3. Fetches active subscriptions for that customer
4. Updates or creates subscription record in database

### Automatic Sync on Page Load
1. User visits billing page or dashboard
2. System checks local subscription
3. If not active, automatically tries to sync from Stripe
4. Updates UI based on subscription status

---

## Code Flow

### Subscription Check Flow
```
User visits page
    ↓
checkUsageLimit() in lib/usage.ts
    ↓
Check local subscription
    ↓
If not active → syncSubscriptionFromStripe()
    ↓
Search Stripe by email
    ↓
Fetch active subscriptions
    ↓
Update database
    ↓
Return subscription status
```

### Webhook Flow
```
Stripe payment completed
    ↓
Stripe sends webhook to /api/webhooks/stripe
    ↓
Verify webhook signature
    ↓
Handle checkout.session.completed
    ↓
Retrieve subscription from Stripe
    ↓
Upsert subscription in database
    ↓
User's plan is now "pro"
```

---

## Environment Variables

Make sure these are set correctly:

```env
# Stripe Keys
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_STRIPE_PRO_PRICE_ID=price_...

# App URL (important for webhooks)
NEXT_PUBLIC_APP_URL=https://your-domain.com

# Database
DATABASE_URL=postgresql://...
```

---

## Testing Checklist

- [ ] Stripe webhook endpoint is configured
- [ ] Webhook secret is correct in `.env`
- [ ] Test payment with Stripe test card: `4242 4242 4242 4242`
- [ ] Check webhook delivery in Stripe Dashboard
- [ ] Verify subscription appears in database
- [ ] Test manual sync button
- [ ] Check debug endpoint output
- [ ] Verify plan shows as "Pro" after sync

---

## Support

If you're still experiencing issues after following this guide:

1. Click "Debug Info" button on billing page
2. Copy the debug information
3. Check the application logs for errors
4. Contact support with:
   - Your email address
   - Debug information
   - Stripe subscription ID (if available)
   - Any error messages

---

## Prevention

To prevent this issue in the future:

1. **Monitor Webhooks**: Regularly check Stripe webhook delivery status
2. **Test Webhooks**: Use Stripe CLI to test webhook delivery locally
3. **Backup Sync**: The automatic sync on page load acts as a backup
4. **User Communication**: Inform users about the sync button if issues occur

---

## Technical Details

### Database Schema
```sql
CREATE TABLE subscriptions (
  id TEXT PRIMARY KEY,
  user_id TEXT UNIQUE NOT NULL,
  stripe_subscription_id TEXT,
  stripe_customer_id TEXT,
  stripe_price_id TEXT,
  stripe_status TEXT,
  plan TEXT, -- "free" or "pro"
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  cancel_at_period_end BOOLEAN,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### Key Functions
- `checkUsageLimit()` - Checks if user can upload, syncs if needed
- `syncSubscriptionFromStripe()` - Manually syncs from Stripe
- `handleCheckoutCompleted()` - Webhook handler for new subscriptions
- `handleSubscriptionUpdated()` - Webhook handler for subscription changes

---

## Logs to Monitor

### Success Logs
```
🔔 Stripe webhook received
✅ Webhook signature verified: checkout.session.completed
💳 Processing checkout.session.completed
👤 User ID from metadata: user_xxx
📋 Retrieved subscription from Stripe
✅ Subscription saved to database
```

### Error Logs
```
❌ Webhook signature verification failed
❌ No userId in session metadata
❌ Subscription not found for customer
❌ No active subscription found in Stripe
```
