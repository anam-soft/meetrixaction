# Environment Variables Fix

## Issue
The Stripe Price ID environment variable was named incorrectly in `.env`:
- **Wrong**: `STRIPE_PRO_PRICE_ID`
- **Correct**: `NEXT_PUBLIC_STRIPE_PRO_PRICE_ID`

## Why This Matters
In Next.js, environment variables that need to be accessible in the browser (client-side) must be prefixed with `NEXT_PUBLIC_`.

The billing page is a client component that needs to read the price ID to send to the API, so it requires the `NEXT_PUBLIC_` prefix.

## What Was Fixed
Updated `.env` file:
```env
# Before
STRIPE_PRO_PRICE_ID=price_1TTYZARuoH55oHIomeva2qdo

# After
NEXT_PUBLIC_STRIPE_PRO_PRICE_ID=price_1TTYZARuoH55oHIomeva2qdo
```

## How to Test
1. **Restart your dev server** (if it didn't auto-reload):
   ```bash
   # Stop the server (Ctrl+C)
   npm run dev
   ```

2. **Login** to your account:
   http://localhost:3000/login

3. **Go to billing page**:
   http://localhost:3000/dashboard/billing

4. **Click "Upgrade to Pro"**:
   - Should now redirect to Stripe checkout
   - Use test card: `4242 4242 4242 4242`

5. **Complete payment**:
   - After payment, you'll be redirected back
   - Your plan should upgrade to Pro

## For Production (Vercel)
Make sure to set this in Vercel environment variables:
```
NEXT_PUBLIC_STRIPE_PRO_PRICE_ID=price_1TTYZARuoH55oHIomeva2qdo
```

## All Required Environment Variables

### Required for Authentication
- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_URL` - Your app URL
- `NEXTAUTH_SECRET` - Generate with: `openssl rand -base64 32`

### Required for Stripe
- `STRIPE_SECRET_KEY` - From Stripe Dashboard
- `STRIPE_WEBHOOK_SECRET` - From Stripe Webhook settings
- `NEXT_PUBLIC_STRIPE_PRO_PRICE_ID` - Your Pro plan price ID
- `NEXT_PUBLIC_APP_URL` - Your app URL (for redirects)

### Optional
- `OPENAI_API_KEY` - For AI features
- `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `AWS_S3_BUCKET` - For file storage
- `FREE_MEETINGS_PER_MONTH` - Default: 5

## Status
✅ Environment variable fixed
✅ Dev server reloaded
✅ Ready to test upgrade feature

Try clicking "Upgrade to Pro" now - it should work!
