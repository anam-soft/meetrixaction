# MeetRix Action - Feature Gates (Free vs Pro)

## Pricing Tiers

### Free Plan - $0/month
Perfect for individuals and small teams getting started

### Pro Plan - $29/month
For teams that need unlimited meetings and advanced features

---

## Feature Comparison Matrix

| Feature | Free | Pro |
|---------|------|-----|
| **Core Features** |
| Meetings per month | 5 | Unlimited |
| AI task extraction | ✅ Yes | ✅ Yes |
| Meeting summary | ✅ Yes | ✅ Yes |
| Task management | ✅ Yes | ✅ Yes |
| File size limit | 200MB | Unlimited |
| **Team Collaboration** |
| Team members | Up to 3 | Unlimited |
| Task assignment | ✅ Yes | ✅ Yes |
| Team dashboard | ✅ Yes | ✅ Yes |
| **Notifications & Reminders** |
| Email reminders | Basic | Advanced |
| Weekly digest | ❌ No | ✅ Yes |
| AI insight in digest | ❌ No | ✅ Yes |
| Deadline notifications | ✅ Yes | ✅ Yes |
| **Analytics & Insights** |
| Task completion tracking | ✅ Yes | ✅ Yes |
| Meeting health score | ❌ No | ✅ Yes |
| Team productivity metrics | Basic | Advanced |
| Custom reports | ❌ No | ✅ Yes |
| **Integrations** |
| Slack integration | ❌ No | ✅ Yes |
| Zoom auto-import | ❌ No | ✅ Yes |
| Google Calendar sync | ❌ No | ✅ Yes |
| Microsoft Teams | ❌ No | ✅ Yes |
| Notion export | ❌ No | ✅ Yes |
| **Advanced Features** |
| API access | ❌ No | ✅ Yes |
| Shareable meeting links | ❌ No | ✅ Yes |
| Custom branding | ❌ No | ✅ Yes |
| Priority support | ❌ No | ✅ Yes |
| SSO (Enterprise) | ❌ No | ❌ No* |

*SSO available on Enterprise plan

---

## Implementation Guide

### 1. Usage Limits

#### Meetings Per Month
```typescript
// lib/usage.ts
export async function checkUsageLimit(userId: string) {
  const subscription = await getSubscription(userId);
  const isPro = subscription?.stripe_status === "active";
  
  const currentMonth = new Date().toISOString().slice(0, 7);
  const meetingsThisMonth = await prisma.meetings.count({
    where: {
      user_id: userId,
      created_at: {
        gte: new Date(`${currentMonth}-01`),
      },
    },
  });
  
  const limit = isPro ? Infinity : 5;
  const canUpload = isPro || meetingsThisMonth < limit;
  
  return {
    canUpload,
    currentUsage: meetingsThisMonth,
    limit,
    isPro,
  };
}
```

#### Team Members Limit
```typescript
export async function checkTeamLimit(userId: string) {
  const subscription = await getSubscription(userId);
  const isPro = subscription?.stripe_status === "active";
  
  const teamMembers = await prisma.team_members.count({
    where: { user_id: userId },
  });
  
  const limit = isPro ? Infinity : 3;
  const canInvite = isPro || teamMembers < limit;
  
  return {
    canInvite,
    currentMembers: teamMembers,
    limit,
    isPro,
  };
}
```

#### File Size Limit
```typescript
export function getFileSizeLimit(isPro: boolean): number {
  return isPro ? Infinity : 200 * 1024 * 1024; // 200MB for free
}
```

### 2. Feature Access Checks

#### Weekly Digest
```typescript
// Only Pro users get weekly digest
if (!isPro) {
  return (
    <div className="glass-card p-6">
      <div className="flex items-center gap-3 mb-4">
        <Mail className="w-6 h-6 text-purple-400" />
        <h3 className="font-semibold">Weekly Digest</h3>
        <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded text-xs">
          PRO
        </span>
      </div>
      <p className="text-muted-foreground mb-4">
        Get AI-powered weekly summaries delivered to your inbox every Monday
      </p>
      <button onClick={() => showUpgradeModal("Weekly Digest")}>
        Upgrade to Pro
      </button>
    </div>
  );
}
```

#### Shareable Links
```typescript
// Only Pro users can generate shareable links
const handleGenerateLink = () => {
  if (!isPro) {
    showUpgradeModal("Shareable Meeting Links");
    return;
  }
  
  generateShareLink(meetingId);
};
```

#### Integrations
```typescript
// Check Pro status before showing integration options
const integrations = [
  { name: "Slack", icon: SlackIcon, prOnly: true },
  { name: "Zoom", icon: ZoomIcon, prOnly: true },
  { name: "Google Calendar", icon: CalendarIcon, prOnly: true },
];

{integrations.map((integration) => (
  <button
    key={integration.name}
    onClick={() => handleIntegrationClick(integration)}
    disabled={integration.prOnly && !isPro}
    className={integration.prOnly && !isPro ? "opacity-50" : ""}
  >
    {integration.name}
    {integration.prOnly && !isPro && (
      <span className="ml-2 text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded">
        PRO
      </span>
    )}
  </button>
))}
```

### 3. UI Components for Feature Gates

#### Pro Badge Component
```tsx
// components/ProBadge.tsx
export function ProBadge() {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded text-xs font-semibold">
      <Sparkles className="w-3 h-3" />
      PRO
    </span>
  );
}
```

#### Feature Lock Component
```tsx
// components/FeatureLock.tsx
interface FeatureLockProps {
  featureName: string;
  description: string;
  icon: React.ReactNode;
  onUpgrade: () => void;
}

export function FeatureLock({ featureName, description, icon, onUpgrade }: FeatureLockProps) {
  return (
    <div className="glass-card p-6 border-2 border-purple-500/30">
      <div className="flex items-start gap-4">
        <div className="p-3 bg-purple-500/20 rounded-lg">
          {icon}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold">{featureName}</h3>
            <ProBadge />
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            {description}
          </p>
          <button
            onClick={onUpgrade}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg text-sm font-semibold hover:shadow-lg transition-shadow"
          >
            Upgrade to unlock
          </button>
        </div>
      </div>
    </div>
  );
}
```

### 4. API Endpoint Guards

#### Meetings API
```typescript
// app/api/meetings/route.ts
export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  const usage = await checkUsageLimit(user.id);
  
  if (!usage.canUpload) {
    return NextResponse.json(
      {
        error: "Usage limit reached",
        message: `You've reached your limit of ${usage.limit} meetings per month. Upgrade to Pro for unlimited meetings.`,
        upgrade: true,
      },
      { status: 403 }
    );
  }
  
  // Proceed with upload
}
```

#### Weekly Digest API
```typescript
// app/api/digest/subscribe/route.ts
export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  const subscription = await getSubscription(user.id);
  const isPro = subscription?.stripe_status === "active";
  
  if (!isPro) {
    return NextResponse.json(
      {
        error: "Pro feature",
        message: "Weekly digest is only available for Pro users.",
        upgrade: true,
      },
      { status: 403 }
    );
  }
  
  // Enable digest
}
```

#### Shareable Links API
```typescript
// app/api/meetings/[id]/share/route.ts
export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  const subscription = await getSubscription(user.id);
  const isPro = subscription?.stripe_status === "active";
  
  if (!isPro) {
    return NextResponse.json(
      {
        error: "Pro feature",
        message: "Shareable meeting links are only available for Pro users.",
        upgrade: true,
      },
      { status: 403 }
    );
  }
  
  // Generate share link
}
```

---

## Feature Descriptions

### Core Features

#### AI Task Extraction
- **Free**: ✅ Full access
- **Pro**: ✅ Full access
- **Description**: Automatically extract action items from meeting transcripts

#### Meeting Summary
- **Free**: ✅ Full access
- **Pro**: ✅ Full access
- **Description**: AI-generated summary of key discussion points

### Team Collaboration

#### Team Members
- **Free**: Up to 3 members
- **Pro**: Unlimited members
- **Implementation**: Check team member count before allowing invites

#### Task Assignment
- **Free**: ✅ Full access
- **Pro**: ✅ Full access
- **Description**: Assign tasks to team members with deadlines

### Notifications

#### Email Reminders
- **Free**: Basic (task deadlines only)
- **Pro**: Advanced (custom reminders, digest, insights)
- **Implementation**: Different email templates based on plan

#### Weekly Digest
- **Free**: ❌ Not available
- **Pro**: ✅ Available
- **Description**: Weekly email with team productivity stats and AI insights

### Analytics

#### Meeting Health Score
- **Free**: ❌ Not available
- **Pro**: ✅ Available
- **Description**: AI-powered score analyzing meeting effectiveness

#### Custom Reports
- **Free**: ❌ Not available
- **Pro**: ✅ Available
- **Description**: Export custom reports in CSV/PDF format

### Integrations

#### Slack Integration
- **Free**: ❌ Not available
- **Pro**: ✅ Available
- **Description**: Post meeting summaries and task reminders to Slack

#### Zoom Auto-Import
- **Free**: ❌ Not available
- **Pro**: ✅ Available
- **Description**: Automatically import Zoom meeting recordings

#### Google Calendar Sync
- **Free**: ❌ Not available
- **Pro**: ✅ Available
- **Description**: Sync meetings and deadlines with Google Calendar

### Advanced Features

#### API Access
- **Free**: ❌ Not available
- **Pro**: ✅ Available
- **Description**: RESTful API for custom integrations

#### Shareable Links
- **Free**: ❌ Not available
- **Pro**: ✅ Available
- **Description**: Generate public links to share meeting summaries

---

## Upgrade Flow

### 1. Detect Feature Access Attempt
```typescript
const handleFeatureClick = (featureName: string) => {
  if (!isPro && isProFeature(featureName)) {
    showUpgradeModal(featureName);
    return;
  }
  
  // Access feature
  accessFeature(featureName);
};
```

### 2. Show Upgrade Modal
```typescript
<UpgradeNudge
  show={showUpgrade}
  onClose={() => setShowUpgrade(false)}
  trigger="pro-feature"
  featureName={selectedFeature}
  isPro={false}
/>
```

### 3. Redirect to Stripe Checkout
```typescript
const handleUpgrade = async () => {
  const response = await fetch("/api/stripe/checkout", {
    method: "POST",
  });
  
  const { url } = await response.json();
  window.location.href = url;
};
```

### 4. Handle Successful Upgrade
```typescript
// After Stripe redirect back
const searchParams = useSearchParams();
if (searchParams.get("success") === "true") {
  // Sync subscription
  await fetch("/api/subscription/sync", { method: "POST" });
  
  // Refresh user data
  await fetchUserData();
  
  // Show success message
  showSuccessToast("Welcome to Pro!");
}
```

---

## Testing Checklist

### Free User Tests
- [ ] Can upload up to 5 meetings per month
- [ ] Blocked from uploading 6th meeting
- [ ] Can add up to 3 team members
- [ ] Blocked from adding 4th team member
- [ ] Cannot access weekly digest
- [ ] Cannot generate shareable links
- [ ] Cannot access integrations
- [ ] File upload limited to 200MB
- [ ] Sees Pro badges on locked features
- [ ] Upgrade modal shows on Pro feature access

### Pro User Tests
- [ ] Can upload unlimited meetings
- [ ] Can add unlimited team members
- [ ] Can access weekly digest
- [ ] Can generate shareable links
- [ ] Can access all integrations
- [ ] No file size limit
- [ ] No Pro badges shown
- [ ] All features accessible

---

## Environment Variables

```env
# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_PRICE_ID=price_... # Pro plan price ID
STRIPE_WEBHOOK_SECRET=whsec_...

# Feature Flags (optional)
ENABLE_INTEGRATIONS=true
ENABLE_API_ACCESS=true
ENABLE_WEEKLY_DIGEST=true
```

---

## Database Schema

### Subscriptions Table
```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  stripe_price_id TEXT,
  stripe_status TEXT, -- 'active', 'canceled', 'past_due'
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  cancel_at_period_end BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Usage Tracking (Optional)
```sql
CREATE TABLE usage_logs (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  action TEXT, -- 'meeting_upload', 'team_invite', etc.
  month TEXT, -- '2024-01'
  count INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## Pricing Page Copy

### Free Plan
**Perfect for getting started**
- 5 meetings per month
- AI task extraction
- Meeting summaries
- Up to 3 team members
- Basic email reminders
- 200MB file size limit

### Pro Plan - $29/month
**For teams that need more**
- **Everything in Free, plus:**
- Unlimited meetings
- Unlimited team members
- Weekly AI digest
- Meeting health scores
- Slack & Zoom integration
- Google Calendar sync
- Shareable meeting links
- API access
- Unlimited file size
- Priority support

---

**Remember**: Always check Pro status server-side, never trust client-side checks alone. Feature gates should be enforced at the API level.
