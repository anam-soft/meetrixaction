# Production Environment Variables for Vercel

## Set these in Vercel Dashboard → Project Settings → Environment Variables

### Required - Database
DATABASE_URL=your_production_postgresql_url

### Required - App URLs
NEXT_PUBLIC_APP_URL=https://meetrixaction.vercel.app
NEXTAUTH_URL=https://meetrixaction.vercel.app

### Required - NextAuth
NEXTAUTH_SECRET=your_nextauth_secret_here

### Required - Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_production_clerk_key
CLERK_SECRET_KEY=your_production_clerk_secret

### Required - Stripe
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
NEXT_PUBLIC_STRIPE_PRO_PRICE_ID=price_1TTYZARuoH55oHIomeva2qdo

### Optional - OpenAI
OPENAI_API_KEY=your_openai_api_key

### Optional - Cloudflare R2 Storage
S3_BUCKET=actionflow-uploads
S3_REGION=auto
S3_ENDPOINT=https://200acf4efae3c6aeab219739ac4568ac.r2.cloudflarestorage.com
S3_ACCESS_KEY=your_r2_access_key
S3_SECRET_KEY=your_r2_secret_key

### Optional - OAuth (if using)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GITHUB_ID=your_github_id
GITHUB_SECRET=your_github_secret

### Optional - Settings
FREE_MEETINGS_PER_MONTH=5
