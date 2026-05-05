# 🧪 Upgrade Flow Testing Guide

## Complete A-Z Testing Checklist for Free → Pro Upgrade System

---

## 🎯 Testing Objectives

Verify that:
1. Free users hit limits correctly
2. Upgrade prompts appear at right moments
3. Payment flow works end-to-end
4. Features unlock immediately after payment
5. Edge cases are handled gracefully

---

## 📋 Pre-Testing Setup

### 1. Environment Variables
Ensure these are set in `.env.local`:

```bash
# Stripe (use TEST keys)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PRICE_ID=price_test_...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
DATABASE_URL=postgresql://...

# Free tier limit
FREE_MEETINGS_PER_MONTH=5
```

### 2. Stripe Test Mode
- Use Stripe Dashboard in **TEST MODE**
- Create test product and price
- Set up webhook endpoint: `http://localhost:3000/api/webhooks/stripe`
- Use Stripe CLI for local webhook testing:
  ```bash
  stripe listen --forward-to localhost:3000/api/webhooks/stripe
  ```

### 3. Test Cards
Use Stripe test cards:
- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **Requires Auth**: `4000 0025 0000 3155`

---

## ✅ Test Case 1: Free User Experience

### Steps:
1. Register new user
2. Login to dashboard
3. Check usage display shows `0/5 meetings`

### Expected Results:
- ✅ Dashboard shows free tier banner
- ✅ Usage counter displays correctly
- ✅ No upgrade modal shown yet
- ✅ Can upload meetings

### Verification:
```bash
# Check user subscription status
curl http://localhost:3000/api/usage
```

---

## ✅ Test Case 2: Soft Limit Warning (4/5 Meetings)

### Steps:
1. Upload 4 meetings
2. Navigate to dashboard
3. Observe banner

### Expected Results:
- ✅ Warning banner appears: "Almost out of free meetings"
- ✅ Banner shows `4/5` usage
- ✅ "Upgrade to Pro" button visible
- ✅ Banner is dismissible
- ✅ Can still upload 1 more meeting

### Analytics Events:
- `banner_shown`
- `banner_dismissed` (if dismissed)

---

## ✅ Test Case 3: Hard Limit (5/5 Meetings)

### Steps:
1. Upload 5th meeting
2. Try to upload 6th meeting
3. Observe modal

### Expected Results:
- ✅ Upload blocked with 403 error
- ✅ `UpgradeLimitModal` appears
- ✅ Modal shows features and pricing
- ✅ "Upgrade to Pro" button prominent
- ✅ "Maybe later" button available
- ✅ Cannot upload without upgrading

### Analytics Events:
- `limit_reached`
- `upgrade_modal_shown`

### API Response:
```json
{
  "error": "Usage limit reached",
  "currentUsage": 5,
  "limit": 5
}
```

---

## ✅ Test Case 4: Upgrade Click → Checkout

### Steps:
1. Click "Upgrade to Pro" in modal
2. Wait for redirect

### Expected Results:
- ✅ Loading state shows "Redirecting..."
- ✅ Redirects to Stripe Checkout
- ✅ Checkout shows correct price ($29/month)
- ✅ User email pre-filled
- ✅ Metadata includes `userId`

### Analytics Events:
- `upgrade_clicked`
- `checkout_initiated`

### Verification:
```bash
# Check checkout session created
stripe checkout sessions list --limit 1
```

---

## ✅ Test Case 5: Successful Payment

### Steps:
1. Enter test card: `4242 4242 4242 4242`
2. Complete payment
3. Wait for redirect

### Expected Results:
- ✅ Payment processes successfully
- ✅ Redirects to `/dashboard?success=true`
- ✅ Success toast appears: "🎉 You're now on Pro plan"
- ✅ Dashboard updates to show Pro status
- ✅ Usage counter shows "Unlimited"
- ✅ Can upload meetings immediately

### Analytics Events:
- `checkout_completed`
- `upgrade_success`

### Webhook Events (Check Stripe Dashboard):
- ✅ `checkout.session.completed` received
- ✅ `invoice.paid` received

### Database Verification:
```sql
SELECT * FROM subscriptions WHERE user_id = 'USER_ID';
-- Should show:
-- plan: 'pro'
-- stripe_status: 'active'
-- current_period_end: (future date)
```

---

## ✅ Test Case 6: Payment Declined

### Steps:
1. Click "Upgrade to Pro"
2. Enter declined card: `4000 0000 0000 0002`
3. Try to complete payment

### Expected Results:
- ✅ Stripe shows decline message
- ✅ User stays on checkout page
- ✅ Can retry with different card
- ✅ No subscription created
- ✅ User remains on free plan

---

## ✅ Test Case 7: Checkout Cancellation

### Steps:
1. Click "Upgrade to Pro"
2. On Stripe checkout, click "Back" or close tab
3. Return to app

### Expected Results:
- ✅ Redirects to `/dashboard?canceled=true`
- ✅ No success toast shown
- ✅ User remains on free plan
- ✅ Can try upgrading again

### Analytics Events:
- `checkout_canceled`

---

## ✅ Test Case 8: Webhook Idempotency

### Steps:
1. Complete successful payment
2. Manually replay webhook from Stripe Dashboard
3. Check database

### Expected Results:
- ✅ Second webhook doesn't create duplicate
- ✅ Logs show "Event already processed"
- ✅ Database has only one subscription record
- ✅ No errors in console

### Verification:
```bash
# Check webhook logs
stripe events list --limit 5
```

---

## ✅ Test Case 9: Real-Time Sync

### Steps:
1. Complete payment
2. Immediately try to upload meeting
3. Check features

### Expected Results:
- ✅ Subscription syncs within 2-3 seconds
- ✅ Can upload meeting immediately
- ✅ No limit enforced
- ✅ Dashboard shows Pro badge

### Manual Sync Test:
```bash
# Trigger manual sync
curl -X POST http://localhost:3000/api/subscription/sync \
  -H "Cookie: your-session-cookie"
```

---

## ✅ Test Case 10: Subscription Cancellation

### Steps:
1. As Pro user, go to billing portal
2. Cancel subscription
3. Check access

### Expected Results:
- ✅ Subscription marked `cancel_at_period_end: true`
- ✅ Pro features remain until period ends
- ✅ After period ends, downgrade to free
- ✅ Webhook `customer.subscription.deleted` processed

### Webhook Verification:
```bash
# Check subscription status
curl http://localhost:3000/api/subscription
```

---

## ✅ Test Case 11: Payment Failure (Existing Subscription)

### Steps:
1. As Pro user, simulate failed renewal
2. Use Stripe Dashboard to trigger `invoice.payment_failed`

### Expected Results:
- ✅ Subscription status → `past_due`
- ✅ User notified of payment issue
- ✅ Stripe retries payment automatically
- ✅ Access may be restricted (configurable)

---

## ✅ Test Case 12: Multiple Browser Tabs

### Steps:
1. Open dashboard in 2 tabs
2. In Tab 1, complete upgrade
3. Switch to Tab 2

### Expected Results:
- ✅ Tab 2 updates when refocused
- ✅ No duplicate checkout sessions
- ✅ Consistent state across tabs

---

## ✅ Test Case 13: Mobile Responsiveness

### Steps:
1. Open on mobile device/emulator
2. Trigger upgrade modal
3. Complete checkout

### Expected Results:
- ✅ Modal displays correctly
- ✅ Stripe checkout mobile-optimized
- ✅ Success toast visible
- ✅ All CTAs tappable

---

## ✅ Test Case 14: Pricing Page

### Steps:
1. Navigate to `/pricing`
2. Click "Upgrade to Pro"
3. Complete flow

### Expected Results:
- ✅ Pricing clearly displayed
- ✅ FAQ section visible
- ✅ Multiple CTAs work
- ✅ Checkout flow identical

### Analytics Events:
- `pricing_page_viewed`
- `upgrade_clicked` (source: 'pricing')

---

## ✅ Test Case 15: Error Handling

### Test Scenarios:

#### A. Network Failure During Checkout
- ✅ Shows error message
- ✅ User can retry
- ✅ No partial state

#### B. Webhook Delivery Failure
- ✅ Manual sync recovers state
- ✅ Stripe retries webhook
- ✅ User can contact support

#### C. Database Connection Error
- ✅ Graceful error message
- ✅ Transaction rollback
- ✅ No data corruption

---

## 📊 Analytics Verification

### Events to Track:
```javascript
// Check browser console for these events:
✅ limit_reached
✅ upgrade_modal_shown
✅ upgrade_modal_dismissed
✅ upgrade_clicked
✅ checkout_initiated
✅ checkout_completed
✅ checkout_canceled
✅ upgrade_success
✅ banner_shown
✅ banner_dismissed
```

### Metrics API:
```bash
# Get conversion metrics
curl http://localhost:3000/api/analytics/track
```

---

## 🔍 Debugging Tools

### 1. Check Subscription Status
```bash
curl http://localhost:3000/api/subscription
```

### 2. Check Usage
```bash
curl http://localhost:3000/api/usage
```

### 3. Force Sync
```bash
curl -X POST http://localhost:3000/api/subscription/sync
```

### 4. Stripe CLI
```bash
# Listen to webhooks
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Trigger test events
stripe trigger checkout.session.completed
stripe trigger invoice.payment_failed
```

### 5. Database Queries
```sql
-- Check user subscription
SELECT * FROM subscriptions WHERE user_id = 'USER_ID';

-- Check usage records
SELECT * FROM usage_records WHERE user_id = 'USER_ID';

-- Check all Pro users
SELECT COUNT(*) FROM subscriptions WHERE plan = 'pro' AND stripe_status = 'active';
```

---

## 🚨 Common Issues & Solutions

### Issue: Webhook not received
**Solution**: 
- Check Stripe CLI is running
- Verify webhook secret matches
- Check firewall/network settings

### Issue: Subscription not updating
**Solution**:
- Call `/api/subscription/sync` manually
- Check webhook logs in Stripe Dashboard
- Verify userId in metadata

### Issue: Still seeing limit after upgrade
**Solution**:
- Hard refresh browser (Cmd+Shift+R)
- Clear cookies and re-login
- Check database subscription status

### Issue: Duplicate subscriptions
**Solution**:
- Check idempotency logic
- Verify event ID tracking
- Review webhook logs

---

## ✅ Production Readiness Checklist

Before deploying to production:

- [ ] Switch to Stripe LIVE keys
- [ ] Update webhook endpoint to production URL
- [ ] Test with real payment (small amount)
- [ ] Verify email notifications work
- [ ] Set up monitoring/alerts
- [ ] Document support procedures
- [ ] Train support team
- [ ] Set up analytics dashboard
- [ ] Configure error tracking (Sentry)
- [ ] Test cancellation flow
- [ ] Verify refund process
- [ ] Check tax compliance
- [ ] Review terms of service
- [ ] Test on multiple devices
- [ ] Load test checkout flow

---

## 📈 Success Metrics

The upgrade system is working correctly when:

1. **Conversion Rate**: > 5% of users hitting limit upgrade
2. **Checkout Completion**: > 80% of initiated checkouts complete
3. **Sync Time**: < 3 seconds from payment to feature unlock
4. **Error Rate**: < 0.1% of transactions fail
5. **Support Tickets**: < 1% of upgrades require support

---

## 🎉 Testing Complete!

Once all test cases pass, the upgrade system is ready for production deployment.

**Remember**: Test in Stripe TEST mode first, then do final verification in LIVE mode with a real payment before full launch.
