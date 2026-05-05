# 🎯 AI Meeting Action Tracker SaaS

> **An execution engine for teams** - Turn meetings into structured, assigned, and completed tasks automatically.

## 📋 Overview

This is a production-ready SaaS application that processes meeting recordings, extracts action items using AI, and tracks task completion with built-in accountability.

## ✨ Key Features

### 🎥 Meeting Processing
- Upload audio/video files (mp3, wav, mp4)
- Automatic transcription using OpenAI Whisper
- AI-powered action item extraction
- Meeting summaries and key decisions

### ✅ Task Management
- Automatically extracted tasks with confidence scores
- Task assignment and deadline tracking
- Status management (pending/completed)
- Overdue task detection

### 💰 Billing & Usage
- **Free Plan**: 5 meetings/month
- **Pro Plan**: Unlimited meetings
- Stripe integration for payments
- Usage tracking and limits enforcement

### 🔐 Authentication
- Clerk-based authentication
- Secure user management
- Automatic user sync with database

### 📊 Dashboard
- Real-time metrics and analytics
- Meeting history
- Task overview
- Usage statistics

## 🏗️ Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS v4, Framer Motion
- **Authentication**: Clerk
- **Database**: PostgreSQL + Prisma ORM
- **AI**: OpenAI GPT-4 + Whisper
- **Storage**: AWS S3 / Cloudflare R2
- **Payments**: Stripe
- **Deployment**: Vercel-ready

## 📁 Project Structure

```
├── app/
│   ├── api/
│   │   ├── meetings/          # Meeting upload & management
│   │   │   └── [id]/
│   │   │       └── process/   # AI processing endpoint
│   │   ├── tasks/             # Task CRUD operations
│   │   ├── usage/             # Usage tracking
│   │   ├── stripe/
│   │   │   └── checkout/      # Stripe checkout
│   │   └── webhooks/
│   │       └── stripe/        # Stripe webhooks
│   ├── dashboard/             # Main dashboard
│   ├── page.tsx               # Landing page
│   └── layout.tsx             # Root layout with Clerk
├── lib/
│   ├── clerk-utils.ts         # User sync utilities
│   ├── openai.ts              # AI processing
│   ├── s3.ts                  # File storage
│   ├── usage.ts               # Usage tracking
│   └── prisma.ts              # Database client
├── prisma/
│   └── schema.prisma          # Database schema
└── middleware.ts              # Clerk route protection
```

## 🗄️ Database Schema

### Core Tables
- **users**: User profiles (synced with Clerk)
- **meetings**: Meeting records and metadata
- **tasks**: Extracted action items
- **subscriptions**: Stripe subscription data
- **usage_records**: Monthly usage tracking

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Clerk account
- OpenAI API key
- Stripe account
- S3-compatible storage

### Environment Variables

Create a `.env` file:

```env
# Database
DATABASE_URL=postgresql://...

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# OpenAI
OPENAI_API_KEY=sk-...

# S3 Storage (Cloudflare R2 or AWS S3)
S3_BUCKET=your-bucket
S3_REGION=auto
S3_ENDPOINT=https://...
S3_ACCESS_KEY=...
S3_SECRET_KEY=...
S3_PUBLIC_URL=https://...

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_PRO_PRICE_ID=price_...

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
FREE_MEETINGS_PER_MONTH=5
```

### Installation

```bash
# Install dependencies
npm install

# Push database schema
npx prisma db push

# Generate Prisma client
npx prisma generate

# Run development server
npm run dev
```

Visit `http://localhost:3000`

## 🔄 Core Workflows

### 1. New User Flow
1. User signs up via Clerk
2. User record created in database
3. Redirected to dashboard
4. Free plan activated (5 meetings/month)

### 2. Meeting Upload Flow
1. User selects audio/video file
2. System checks usage limits
3. File uploaded to S3
4. Meeting record created
5. Usage counter incremented
6. Processing triggered

### 3. AI Processing Flow
1. Audio transcribed (Whisper API)
2. Transcript analyzed (GPT-4)
3. Action items extracted
4. Tasks created in database
5. Meeting status updated to "done"

### 4. Upgrade Flow
1. User clicks "Upgrade to Pro"
2. Redirected to Stripe Checkout
3. Payment processed
4. Webhook updates subscription
5. Unlimited meetings unlocked

## 🔌 API Endpoints

### Meetings
- `POST /api/meetings` - Upload meeting
- `GET /api/meetings` - List meetings
- `POST /api/meetings/[id]/process` - Process meeting

### Tasks
- `GET /api/tasks` - List tasks
- `PATCH /api/tasks` - Update task

### Usage
- `GET /api/usage` - Get current usage

### Billing
- `POST /api/stripe/checkout` - Create checkout session
- `POST /api/webhooks/stripe` - Handle Stripe webhooks

## 🎨 UI Components

### Dashboard
- Usage banner with upgrade CTA
- Stats cards (meetings, tasks, overdue)
- File upload interface
- Recent meetings list
- Recent tasks list with completion toggle

### Landing Page
- Hero section with value proposition
- Feature highlights
- Pricing comparison
- Clerk sign-in/sign-up integration

## 🔒 Security

- Clerk handles authentication
- Route protection via middleware
- Stripe webhook signature verification
- User authorization on all API routes
- Secure file uploads to S3

## 📊 Usage Limits

### Free Plan
- 5 meetings per month
- Enforced before upload
- Resets monthly

### Pro Plan
- Unlimited meetings
- Checked via subscription status

## 🪝 Webhooks

### Stripe Events Handled
- `checkout.session.completed` - Activate Pro
- `customer.subscription.updated` - Update subscription
- `customer.subscription.deleted` - Downgrade to Free
- `invoice.payment_failed` - Mark past_due

## 🧪 Testing

### Test the Upload Flow
1. Sign up for an account
2. Upload a test audio file
3. Wait for processing
4. Check tasks in dashboard

### Test Usage Limits
1. Upload 5 meetings (free limit)
2. Try uploading 6th meeting
3. Should see upgrade prompt

### Test Stripe Integration
1. Click "Upgrade to Pro"
2. Use test card: `4242 4242 4242 4242`
3. Complete checkout
4. Verify unlimited access

## 🚀 Deployment

### Vercel Deployment
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
```

### Post-Deployment
1. Update Clerk allowed origins
2. Update Stripe webhook endpoint
3. Configure S3 CORS if needed
4. Test production webhooks

## 📈 Monitoring

### Key Metrics to Track
- Meetings per user
- Task completion rate
- Free → Pro conversion
- User retention
- Processing success rate

## 🔮 Future Enhancements

- [ ] Real-time meeting capture
- [ ] Slack integration
- [ ] Team collaboration features
- [ ] Email notifications
- [ ] Advanced analytics dashboard
- [ ] Mobile app
- [ ] Calendar integration
- [ ] Custom AI prompts

## 🐛 Troubleshooting

### Common Issues

**Clerk not working**
- Check environment variables
- Verify allowed origins in Clerk dashboard

**Stripe webhooks failing**
- Verify webhook secret
- Check endpoint URL
- Test with Stripe CLI

**AI processing stuck**
- Check OpenAI API key
- Verify file URL accessibility
- Check logs for errors

**Upload fails**
- Verify S3 credentials
- Check file size limits
- Ensure correct CORS settings

## 📝 License

MIT License - feel free to use for your projects!

## 🤝 Contributing

This is a reference implementation. Feel free to fork and customize for your needs.

---

**Built with ❤️ using Next.js, Clerk, OpenAI, and Stripe**
