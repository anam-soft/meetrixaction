# Vercel Build Fix for NextAuth + Prisma

## Problem
The build was failing on Vercel with the error:
```
Error: Failed to collect page data for /api/auth/[...nextauth]
clientVersion: '5.22.0'
```

This happened because:
1. Next.js was trying to statically generate API routes during build time
2. Prisma client was being initialized without a DATABASE_URL during build
3. The build process required database access that wasn't available in the Vercel build environment

## Solution Applied

### 1. **Updated Build Scripts**
Modified `package.json` to ensure Prisma client is generated:
```json
{
  "scripts": {
    "build": "prisma generate && next build",
    "postinstall": "prisma generate"
  }
}
```

The `postinstall` script ensures Prisma generates the client after dependencies are installed, and the build command explicitly generates it before building.

### 2. **Created Mock Prisma Client for Build Time**
Updated `lib/prisma.ts` to use a Proxy-based mock client when DATABASE_URL is not available:

```typescript
const createPrismaClient = () => {
  if (!process.env.DATABASE_URL) {
    console.warn('DATABASE_URL not found, using mock Prisma client for build')
    return new Proxy({} as PrismaClient, {
      get: () => {
        return new Proxy(() => {}, {
          apply: () => Promise.resolve(null),
          get: () => createPrismaClient()
        })
      }
    })
  }
  return new PrismaClient({ ... })
}
```

This allows the build to succeed even without database access, as the mock client returns null for all operations.

### 3. **Force Dynamic Rendering on All API Routes**
Added `export const dynamic = 'force-dynamic'` to all API routes to prevent static generation:
- `/api/auth/[...nextauth]/route.ts`
- `/api/register/route.ts`
- `/api/subscription/route.ts`
- `/api/usage/route.ts`
- `/api/meetings/route.ts`
- `/api/meetings/[id]/process/route.ts`
- `/api/tasks/route.ts`
- `/api/stripe/checkout/route.ts`
- `/api/stripe/portal/route.ts`
- `/api/webhooks/stripe/route.ts`

### 4. **Added Database URL Check in Auth**
Added explicit check for DATABASE_URL in the authorize function to fail gracefully during build:
```typescript
if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL not configured")
  return null
}
```

### 5. **Moved NextAuth Configuration Inline**
Moved the NextAuth configuration directly into the route file (`app/api/auth/[...nextauth]/route.ts`) instead of importing from `lib/auth.ts`. This prevents module-level initialization issues during build.

## Deployment to Vercel

### Required Environment Variables
Make sure these are set in your Vercel project settings:

1. **Database**
   - `DATABASE_URL` - Your PostgreSQL connection string (e.g., from Neon, Supabase, or Railway)

2. **NextAuth**
   - `NEXTAUTH_URL` - Your production URL (e.g., `https://yourdomain.vercel.app`)
   - `NEXTAUTH_SECRET` - Generate with: `openssl rand -base64 32`

3. **Stripe** (if using)
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `NEXT_PUBLIC_STRIPE_PRO_PRICE_ID`
   - `NEXT_PUBLIC_APP_URL`

4. **OpenAI** (if using)
   - `OPENAI_API_KEY`

5. **AWS S3** (if using)
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
   - `AWS_REGION`
   - `AWS_S3_BUCKET`

### Build Command
The build command in `package.json` should work automatically:
```bash
prisma generate && next build
```

Vercel will use this command automatically when deploying.

### Important Notes

1. **Database Access During Build**: The build will now succeed even without database access during the build phase. The mock Prisma client allows the build to complete, and the real database is only accessed at runtime when API routes are called.

2. **Prisma Generate**: The `postinstall` script ensures Prisma client is generated after `npm install`, and the build command explicitly runs it again before building.

3. **Environment Variables**: Make sure all required environment variables are set in Vercel's project settings before deploying. The build will succeed without them, but the app won't function correctly at runtime.

4. **First Deployment**: After the first successful deployment, test all authentication flows to ensure everything works correctly.

## Testing Locally

To test the build locally:

### Without Database (simulates Vercel build environment):
```bash
# Remove DATABASE_URL temporarily
unset DATABASE_URL

# Generate Prisma client
npx prisma generate

# Run build (should succeed with mock client)
npm run build

# Start production server
npm start
```

### With Database (normal production mode):
```bash
# Make sure DATABASE_URL is set in .env
# Generate Prisma client
npx prisma generate

# Run build
npm run build

# Start production server
npm start
```

## Troubleshooting

If you still encounter build errors:

### 1. Prisma Client Not Generated
**Error**: `Cannot find module '@prisma/client'`

**Solution**: 
```bash
npx prisma generate
npm run build
```

### 2. Database Connection During Build
**Error**: `Can't reach database server`

**Solution**: This is expected during build. The mock client should handle this. Make sure you've updated `lib/prisma.ts` with the Proxy-based mock client.

### 3. Environment Variables Not Set
**Error**: Auth not working after deployment

**Solution**: 
- Go to Vercel Project Settings → Environment Variables
- Add all required variables (especially `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`)
- Redeploy the project

### 4. NextAuth Secret Missing
**Error**: `[next-auth][error][NO_SECRET]`

**Solution**: Generate and set NEXTAUTH_SECRET:
```bash
openssl rand -base64 32
```
Add this to Vercel environment variables.

### 5. Check Build Logs
If build still fails, check Vercel's deployment logs for specific error messages. Look for:
- Prisma generation errors
- Missing dependencies
- TypeScript compilation errors

## What Changed

- ✅ Build script now includes `prisma generate`
- ✅ Added `postinstall` script for automatic Prisma generation
- ✅ Prisma client uses mock Proxy when DATABASE_URL is missing
- ✅ All API routes use dynamic rendering
- ✅ NextAuth configuration moved inline to prevent module initialization issues
- ✅ Added explicit DATABASE_URL check in auth flow
- ✅ Added proper error handling for missing database connection
- ✅ Build process no longer requires database access

## Architecture

```
Build Time (No Database Required)
├── npm install
├── postinstall: prisma generate
├── prisma generate (explicit in build command)
├── next build
│   ├── Mock Prisma Client used (no DATABASE_URL)
│   ├── API routes marked as dynamic (no static generation)
│   └── Build succeeds without database
└── Build artifacts created

Runtime (Database Required)
├── User requests API route
├── Real Prisma Client initialized (with DATABASE_URL)
├── Database queries executed
└── Response returned
```

The application should now build successfully on Vercel! 🎉
