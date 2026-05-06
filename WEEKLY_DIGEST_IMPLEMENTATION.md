# Weekly Digest Email System

## Overview
Automated weekly email digest sent every Monday at 8:00 AM to all team members, summarizing the past week's productivity and task completion.

## Components Created

### 1. Email Template (`lib/email-templates/weekly-digest.ts`)

Professional HTML email template with:
- **Header**: MeetRix branding, week date range, team name
- **Stats Row**: 3 cards showing completed, open, and overdue tasks
- **AI Insight Block**: 1-2 sentence AI observation (Pro only)
- **Overdue Tasks Section**: List of overdue items with assignees
- **Completed This Week**: List of done tasks (max 10 shown)
- **CTA Button**: "View Full Report" → /dashboard
- **Footer**: Preferences link, unsubscribe option

### 2. AI Insight Generator (`lib/weekly-digest.ts`)

Uses OpenAI GPT-4 to generate contextual insights:
- Analyzes completion rate trends
- Identifies recurring overdue patterns
- Provides positive, data-driven observations
- Professional, concise, encouraging tone

### 3. Cron Endpoint (`app/api/cron/weekly-digest/route.ts`)

Automated endpoint that:
- Fetches all users
- Calculates weekly stats per user
- Generates AI insights for Pro users
- Prepares email HTML
- Sends emails via email service

### 4. Vercel Cron Configuration (`vercel.json`)

Schedules the cron job:
```json
{
  "crons": [{
    "path": "/api/cron/weekly-digest",
    "schedule": "0 8 * * 1"
  }]
}
```

## Email Structure

### Subject Line
```
Your team's week in review — MeetRix Action
```

### Header Section
- **Logo**: ✨ MeetRix Action
- **Week Range**: "Dec 18 - Dec 25, 2023"
- **Team Name**: User's name or team name

### Stats Cards
Three prominent cards showing:

1. **Completed** (Green)
   - Number of tasks completed
   - Label: "COMPLETED"

2. **Still Open** (Blue)
   - Number of pending tasks
   - Label: "STILL OPEN"

3. **Overdue** (Red)
   - Number of overdue tasks
   - Label: "OVERDUE"

### AI Insight Block (Pro Only)
- **Badge**: "✨ AI INSIGHT"
- **Content**: 1-2 sentences analyzing team performance
- **Styling**: Purple gradient background
- **Example**: "Your team completed 85% of tasks this week, up 15% from last week. Great momentum on project deliverables!"

### Overdue Tasks Section
- **Icon**: ⚠️
- **Title**: "Overdue Tasks"
- **List**: Up to 10 overdue tasks
- **Each Item Shows**:
  - Task title
  - Assignee (👤 icon)
  - Due date (📅 icon)
- **Styling**: Red accent border

### Completed Tasks Section
- **Icon**: ✅
- **Title**: "Completed This Week"
- **List**: Up to 10 completed tasks
- **Each Item Shows**:
  - Task title
  - Assignee (👤 icon)
- **Overflow**: Shows "+ X more completed tasks" if >10

### CTA Section
- **Button**: "View Full Report →"
- **Link**: Dashboard URL
- **Styling**: Purple-pink gradient button

### Footer
- **Schedule**: "Sent every Monday at 8:00 AM"
- **Links**: Manage preferences · Unsubscribe
- **Copyright**: © 2024 MeetRix Action

## AI Insight Generation

### Prompt Template
```
Given this team's task data for the past week, write 1-2 sentences of insight.
Focus on: completion rate trend vs last week, any recurring overdue patterns, positive observations.
Be specific with numbers. Keep it encouraging but honest.
Tone: professional, concise, data-driven.

Data:
- Tasks completed this week: {tasksCompleted}
- Tasks still open: {tasksOpen}
- Tasks overdue: {tasksOverdue}
- Completion rate this week: {completionRate}%
- Completion rate last week: {lastWeekCompletionRate}%
- Recurring overdue patterns: {overduePatterns}
```

### Example Insights

**Positive Trend:**
> "Your team completed 85% of tasks this week, up 15% from last week. Great momentum on project deliverables!"

**Needs Improvement:**
> "Completion rate dropped to 60% this week from 75% last week. Consider reviewing task priorities to get back on track."

**Overdue Pattern:**
> "Your team completed 12 tasks this week, but 5 items remain overdue for more than 7 days. Focus on clearing the backlog."

**Steady Performance:**
> "Consistent 70% completion rate maintained for the third week. Team is showing reliable delivery patterns."

## Cron Job Configuration

### Schedule
- **Frequency**: Every Monday
- **Time**: 8:00 AM
- **Timezone**: Per user's timezone (future enhancement)
- **Cron Expression**: `0 8 * * 1`

### Vercel Cron Setup

1. Add `vercel.json` to project root
2. Deploy to Vercel
3. Cron automatically configured
4. View logs in Vercel dashboard

### Alternative: GitHub Actions

```yaml
name: Weekly Digest
on:
  schedule:
    - cron: '0 8 * * 1'
jobs:
  send-digest:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger digest
        run: |
          curl -X POST https://your-app.vercel.app/api/cron/weekly-digest \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}"
```

## Security

### Cron Secret
Protect the endpoint with a secret token:

```typescript
const authHeader = request.headers.get("authorization");
if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
```

### Environment Variable
```env
CRON_SECRET=your-random-secret-token-here
```

## Email Service Integration

### Supported Services

#### 1. Resend (Recommended)
```typescript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

await resend.emails.send({
  from: 'MeetRix Action <digest@meetrixaction.com>',
  to: user.email,
  subject: "Your team's week in review — MeetRix Action",
  html: emailHtml,
});
```

#### 2. SendGrid
```typescript
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

await sgMail.send({
  to: user.email,
  from: 'digest@meetrixaction.com',
  subject: "Your team's week in review — MeetRix Action",
  html: emailHtml,
});
```

#### 3. AWS SES
```typescript
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

const ses = new SESClient({ region: "us-east-1" });

await ses.send(new SendEmailCommand({
  Source: 'digest@meetrixaction.com',
  Destination: { ToAddresses: [user.email] },
  Message: {
    Subject: { Data: "Your team's week in review — MeetRix Action" },
    Body: { Html: { Data: emailHtml } },
  },
}));
```

## Data Collection

### Weekly Stats Calculation

```typescript
// Current week tasks
const tasks = await prisma.tasks.findMany({
  where: {
    meetings: { user_id: user.id },
    created_at: { gte: weekStart, lte: weekEnd },
  },
});

// Calculate metrics
const tasksCompleted = tasks.filter(t => t.status === "completed").length;
const tasksOpen = tasks.filter(t => t.status === "pending").length;
const tasksOverdue = tasks.filter(
  t => t.status === "pending" && t.deadline && new Date(t.deadline) < now
).length;

// Completion rate
const completionRate = tasks.length > 0 
  ? Math.round((tasksCompleted / tasks.length) * 100) 
  : 0;
```

### Previous Week Comparison

```typescript
// Previous week tasks for trend analysis
const prevWeekTasks = await prisma.tasks.findMany({
  where: {
    meetings: { user_id: user.id },
    created_at: { gte: prevWeekStart, lte: weekStart },
  },
});

const lastWeekCompletionRate = prevWeekTasks.length > 0
  ? Math.round((prevWeekCompleted / prevWeekTasks.length) * 100)
  : 0;
```

## User Preferences

### Digest Settings (Future Enhancement)

Add to user settings page:

```typescript
interface DigestPreferences {
  enabled: boolean;
  frequency: "weekly" | "biweekly" | "monthly";
  dayOfWeek: "monday" | "tuesday" | "wednesday" | "thursday" | "friday";
  time: string; // "08:00"
  timezone: string; // "America/New_York"
  includeCompletedTasks: boolean;
  includeOverdueTasks: boolean;
  aiInsightsEnabled: boolean; // Pro only
}
```

### Unsubscribe Flow

1. User clicks "Unsubscribe" in email
2. Redirects to `/unsubscribe?token={userId}`
3. Confirm unsubscribe page
4. Update user preferences in database
5. Show confirmation message

## Testing

### Manual Test Endpoint

Create a test endpoint for development:

```typescript
// app/api/test/weekly-digest/route.ts
export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get("userId");
  
  // Generate digest for specific user
  // Return HTML for preview
}
```

### Preview in Browser

```bash
curl http://localhost:3000/api/test/weekly-digest?userId=123 > digest.html
open digest.html
```

### Email Testing Services

- **Mailtrap**: Test email delivery
- **Litmus**: Test email rendering across clients
- **Email on Acid**: Cross-client compatibility

## Monitoring

### Track Metrics

```typescript
// Log digest generation
console.log(`Digest sent to ${user.email}`, {
  userId: user.id,
  tasksCompleted,
  tasksOverdue,
  isPro,
  aiInsightGenerated: !!aiInsight,
});
```

### Analytics Events

```typescript
analytics.track("weekly_digest_sent", {
  userId: user.id,
  tasksCompleted,
  tasksOverdue,
  completionRate,
  isPro,
});
```

### Error Handling

```typescript
try {
  await sendEmail(user.email, subject, html);
  results.push({ userId, status: "sent" });
} catch (error) {
  console.error(`Failed to send digest to ${user.email}:`, error);
  results.push({ userId, status: "failed", error: error.message });
}
```

## Environment Variables

```env
# Required
CRON_SECRET=your-cron-secret
OPENAI_API_KEY=sk-...
NEXT_PUBLIC_APP_URL=https://your-app.com

# Email Service (choose one)
RESEND_API_KEY=re_...
# OR
SENDGRID_API_KEY=SG...
# OR
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
```

## Responsive Design

The email template is fully responsive:

- **Desktop**: 3-column stats layout
- **Mobile**: Stacked single-column layout
- **Max Width**: 600px
- **Font Scaling**: Readable on all devices
- **Touch Targets**: Buttons sized for mobile

## Best Practices

### Do's ✅
- Send at consistent time each week
- Keep content concise and scannable
- Use clear CTAs
- Provide unsubscribe option
- Test across email clients
- Monitor delivery rates
- Track engagement metrics

### Don'ts ❌
- Send too frequently
- Include too much data
- Use complex layouts
- Forget mobile optimization
- Ignore unsubscribe requests
- Send without user consent

## Future Enhancements

- [ ] Per-user timezone support
- [ ] Customizable digest frequency
- [ ] Team-level digests (not just individual)
- [ ] Digest preview before sending
- [ ] A/B testing different formats
- [ ] Digest analytics dashboard
- [ ] Email open/click tracking
- [ ] Personalized recommendations
- [ ] Integration with calendar
- [ ] Slack/Teams digest option

## Files Created

1. ✅ `lib/weekly-digest.ts` - AI insight generator
2. ✅ `lib/email-templates/weekly-digest.ts` - HTML email template
3. ✅ `app/api/cron/weekly-digest/route.ts` - Cron endpoint
4. ✅ `vercel.json` - Cron configuration

## Dependencies

```json
{
  "openai": "^4.x.x",
  "resend": "^2.x.x"
}
```

---

**Status**: ✅ Implementation Complete
**Last Updated**: 2026-05-05
**Version**: 1.0.0
