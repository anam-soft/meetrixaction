# Vercel Environment Variables Setup

## Production URL
**https://meetrixaction.vercel.app/**

## Required Environment Variables

Go to your Vercel project settings and add these environment variables:

### 1. NextAuth Configuration (REQUIRED)
```env
NEXTAUTH_URL=https://meetrixaction.vercel.app
NEXTAUTH_SECRET=<generate-with-command-below>
```

**Generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```
Copy the output and paste it as the value for `NEXTAUTH_SECRET`

### 2. Database (REQUIRED)
```env
DATABASE_URL=postgresql://user:password@host:5432/database
```

**Recommended Database Providers:**
- **Neon** (https://neon.tech) - Free tier, serverless PostgreSQL
- **Supabase** (https://supabase.com) - Free tier, use connection pooling URL
- **Railway** (https://railway.app) - PostgreSQL hosting

### 3. Stripe (Optional - if using payments)
```env
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PRO_PRICE_ID=price_...
NEXT_PUBLIC_APP_URL=https://meetrixaction.vercel.app
```

### 4. OpenAI (Optional - if using AI features)
```env
OPENAI_API_KEY=sk-...
```

### 5. AWS S3 (Optional - if using file uploads)
```env
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket-name
```

## Step-by-Step Setup

### Step 1: Set Environment Variables in Vercel
1. Go to https://vercel.com/dashboard
2. Select your project (meetrixaction)
3. Go to **Settings** → **Environment Variables**
4. Add each variable above
5. Select **Production**, **Preview**, and **Development** for each variable

### Step 2: Redeploy
After adding environment variables:
1. Go to **Deployments** tab
2. Click the three dots on the latest deployment
3. Click **Redeploy**
4. Or push a new commit to trigger automatic deployment

### Step 3: Set Up Database Schema
After deployment succeeds, push your database schema:

```bash
# Set your production DATABASE_URL
export DATABASE_URL="your-production-database-url"

# Push the schema to your database
npx prisma db push

# Verify it worked
npx prisma studio
```

### Step 4: Configure Stripe Webhooks (if using Stripe)
1. Go to Stripe Dashboard → Developers → Webhooks
2. Click **Add endpoint**
3. Enter: `https://meetrixaction.vercel.app/api/webhooks/stripe`
4. Select events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Copy the **Signing secret** and add it as `STRIPE_WEBHOOK_SECRET` in Vercel

## Quick Checklist

- [ ] Added `NEXTAUTH_URL=https://meetrixaction.vercel.app`
- [ ] Generated and added `NEXTAUTH_SECRET`
- [ ] Added `DATABASE_URL` from your database provider
- [ ] Redeployed the application
- [ ] Ran `prisma db push` to set up database schema
- [ ] Tested registration at https://meetrixaction.vercel.app/register
- [ ] Tested login at https://meetrixaction.vercel.app/login
- [ ] Verified dashboard access after login
- [ ] (Optional) Configured Stripe webhooks
- [ ] (Optional) Added OpenAI API key
- [ ] (Optional) Configured AWS S3

## Testing Your Deployment

### 1. Test Homepage
Visit: https://meetrixaction.vercel.app/

### 2. Test Registration
1. Go to: https://meetrixaction.vercel.app/register
2. Create a new account
3. Should redirect to dashboard

### 3. Test Login
1. Go to: https://meetrixaction.vercel.app/login
2. Log in with your credentials
3. Should redirect to dashboard

### 4. Test API Routes
Check that API routes are working:
- https://meetrixaction.vercel.app/api/auth/providers (should return JSON)

## Troubleshooting

### Build Succeeds but Can't Log In
**Problem**: Authentication doesn't work

**Check:**
1. Is `DATABASE_URL` set in Vercel?
2. Is `NEXTAUTH_SECRET` set?
3. Is `NEXTAUTH_URL` exactly `https://meetrixaction.vercel.app`?
4. Did you run `prisma db push`?

### "Invalid credentials" Error
**Problem**: Can't log in with valid credentials

**Solution:**
1. Check database connection
2. Verify user exists in database: `npx prisma studio`
3. Check Vercel function logs for errors

### Database Connection Error
**Problem**: "Can't reach database server"

**Solution:**
1. Verify `DATABASE_URL` is correct
2. Check database is accessible from Vercel's servers
3. For Neon/Supabase, use connection pooling URL
4. Test connection locally first

### Environment Variables Not Loading
**Problem**: Features work locally but not on Vercel

**Solution:**
1. Verify all variables are set in Vercel
2. Check they're enabled for "Production" environment
3. Redeploy after adding variables (they don't apply to existing deployments)

## Current Status

✅ Code pushed to GitHub
✅ Build configuration fixed
✅ Ready to deploy

**Next Action:** Add the environment variables above in Vercel and redeploy!
