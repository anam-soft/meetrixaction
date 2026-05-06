# Upgrade Nudge Component Implementation

## Overview
Smart upgrade nudge system that shows contextual upgrade prompts to free users at key moments without being intrusive.

## Components Created

### 1. UpgradeNudge Component (`components/UpgradeNudge.tsx`)

A premium modal that displays upgrade prompts with:
- **Dynamic messaging** based on trigger type
- **Usage visualization** with progress bar
- **Pro features list** with checkmarks
- **Pricing display** with $29/month
- **Trust badges** (secure payment, cancel anytime)
- **Smooth animations** and premium styling

#### Props:
```typescript
interface UpgradeNudgeProps {
  show: boolean;
  onClose: () => void;
  trigger: "meeting-limit" | "team-limit" | "pro-feature";
  currentUsage?: number;
  limit?: number;
  featureName?: string;
}
```

### 2. useUpgradeNudge Hook (`lib/useUpgradeNudge.ts`)

Custom hook to manage nudge logic:
- **Smart timing** - doesn't show too frequently
- **Local storage** - remembers dismissals (1 hour cooldown)
- **Multiple triggers** - meeting limit, team limit, pro features
- **Usage tracking** - monitors current usage vs limits

#### API:
```typescript
const {
  showNudge,           // Boolean to show/hide nudge
  nudgeTrigger,        // Current trigger type
  currentUsage,        // Current usage count
  limit,               // Usage limit
  featureName,         // Pro feature name
  checkMeetingLimit,   // Check if meeting limit reached
  checkTeamLimit,      // Check if team limit reached
  checkProFeature,     // Check if accessing pro feature
  dismissNudge,        // Dismiss and store cooldown
} = useUpgradeNudge();
```

## Trigger Scenarios

### 1. Meeting Limit Trigger
**When:** User uploads their 4th or 5th meeting

**Messages:**
- 4th meeting: "You have 1 free meeting left"
- 5th meeting: "You've reached your meeting limit"

**Visual:** Progress bar showing 4/5 or 5/5

**Implementation:**
```typescript
upgradeNudge.checkMeetingLimit(currentUsage, limit, isPro);
```

### 2. Team Limit Trigger
**When:** User tries to invite 3rd team member

**Message:** "Upgrade to add more team members"

**Details:** Free plan limited to 2 team members

**Implementation:**
```typescript
upgradeNudge.checkTeamLimit(memberCount, isPro);
```

### 3. Pro Feature Trigger
**When:** User tries to access pro-only features like:
- Email digests
- Integrations (Slack, Notion, etc.)
- Advanced analytics
- Custom exports

**Message:** "[Feature Name] is a Pro feature"

**Implementation:**
```typescript
upgradeNudge.checkProFeature("Email Digests", isPro);
```

## Features

### Smart Timing
- ✅ 1-hour cooldown after dismissal
- ✅ Different cooldowns per trigger type
- ✅ Stored in localStorage
- ✅ Won't show to Pro users

### Premium UI
- ✅ Dark gradient theme with purple/pink accents
- ✅ Glassmorphism effects
- ✅ Smooth animations (fade-in, zoom-in)
- ✅ Progress bar for usage visualization
- ✅ Feature list with checkmarks
- ✅ Pricing card with save badge
- ✅ Trust badges at bottom

### User Experience
- ✅ Non-intrusive - can be dismissed
- ✅ Contextual - shows relevant message
- ✅ Informative - explains limits clearly
- ✅ Actionable - direct upgrade button
- ✅ Flexible - "Maybe later" option

## Integration Points

### Dashboard (`app/dashboard/page.tsx`)
```typescript
import UpgradeNudge from "@/components/UpgradeNudge"
import { useUpgradeNudge } from "@/lib/useUpgradeNudge"

const upgradeNudge = useUpgradeNudge()

// Check usage after fetching
const fetchUsage = async () => {
  const data = await fetch("/api/usage").then(r => r.json())
  setUsage(data)
  
  if (!data.isPro) {
    upgradeNudge.checkMeetingLimit(data.currentUsage, data.limit, data.isPro)
  }
}

// Render component
<UpgradeNudge
  show={upgradeNudge.showNudge}
  onClose={upgradeNudge.dismissNudge}
  trigger={upgradeNudge.nudgeTrigger || "meeting-limit"}
  currentUsage={upgradeNudge.currentUsage}
  limit={upgradeNudge.limit}
  featureName={upgradeNudge.featureName}
/>
```

### Team Page (Example)
```typescript
const handleInviteMember = () => {
  const memberCount = team.members.length
  
  if (!isPro && memberCount >= 2) {
    upgradeNudge.checkTeamLimit(memberCount, isPro)
    return
  }
  
  // Proceed with invite
  showInviteModal()
}
```

### Pro Feature Access (Example)
```typescript
const handleAccessProFeature = (featureName: string) => {
  if (!isPro) {
    upgradeNudge.checkProFeature(featureName, isPro)
    return
  }
  
  // Access feature
  openFeature()
}
```

## Pro Features Listed

1. ✅ Unlimited meetings per month
2. ✅ Unlimited team members
3. ✅ Advanced AI insights & summaries
4. ✅ Priority email support
5. ✅ Custom integrations
6. ✅ Export to your favorite tools

## Pricing Display

- **Price:** $29/month
- **Badge:** "Save 20% yearly"
- **CTA:** "Upgrade to Pro" with Sparkles icon
- **Secondary:** "Maybe later" dismiss button

## Cooldown System

### Storage Keys:
- `nudge_dismissed_meeting_1_left` - When 1 meeting left
- `nudge_dismissed_meeting_limit_reached` - When limit reached
- `nudge_dismissed_team_limit` - When team limit hit
- `nudge_dismissed_pro_feature_{featureName}` - Per feature

### Cooldown Period:
- **Duration:** 1 hour (3600000ms)
- **Purpose:** Prevent nudge fatigue
- **Reset:** Automatic after cooldown expires

## Upgrade Flow

1. User triggers nudge condition
2. Hook checks cooldown in localStorage
3. If no recent dismissal, show nudge
4. User clicks "Upgrade to Pro"
5. Loading state shown
6. Redirect to Stripe checkout
7. After payment, redirect back with success
8. Subscription synced automatically

## Styling

### Colors
- **Primary Gradient:** Purple (#9333EA) to Pink (#EC4899)
- **Background:** Dark gray with purple tint
- **Text:** White with gray muted
- **Success:** Green (#10B981)
- **Progress Bar:** Purple-pink gradient

### Animations
- **Modal:** fade-in + zoom-in-95
- **Header:** Pulsing gradient background
- **Button:** Scale on hover (105%)
- **Progress:** Smooth width transition

## Testing Checklist

- [ ] Shows when user has 1 meeting left
- [ ] Shows when user reaches meeting limit
- [ ] Shows when trying to add 3rd team member
- [ ] Shows when accessing pro features
- [ ] Dismissal stores cooldown correctly
- [ ] Doesn't show within 1 hour of dismissal
- [ ] Doesn't show to Pro users
- [ ] Progress bar displays correctly
- [ ] Upgrade button redirects to Stripe
- [ ] "Maybe later" dismisses modal
- [ ] Modal can't be closed during checkout loading
- [ ] Trust badges display correctly

## Future Enhancements

### Planned Features
- [ ] A/B testing different messages
- [ ] Analytics tracking for conversion
- [ ] Custom cooldown periods per trigger
- [ ] Animated confetti on upgrade
- [ ] Testimonials in modal
- [ ] Video demo of pro features
- [ ] Limited-time discount offers
- [ ] Referral program integration

### Advanced Triggers
- [ ] After X days of usage
- [ ] When exporting large datasets
- [ ] When viewing advanced analytics
- [ ] When scheduling meetings
- [ ] When using API limits

## Analytics Events

Track these events for optimization:
```typescript
// When nudge is shown
analytics.track("upgrade_nudge_shown", {
  trigger: "meeting-limit",
  currentUsage: 4,
  limit: 5
})

// When user clicks upgrade
analytics.track("upgrade_nudge_clicked", {
  trigger: "meeting-limit"
})

// When user dismisses
analytics.track("upgrade_nudge_dismissed", {
  trigger: "meeting-limit"
})
```

## Best Practices

### Do's ✅
- Show at natural breakpoints
- Explain value clearly
- Make dismissal easy
- Respect cooldown periods
- Track conversion metrics

### Don'ts ❌
- Show too frequently
- Block critical workflows
- Use aggressive language
- Hide dismiss button
- Show to Pro users

## Files Modified

1. ✅ `components/UpgradeNudge.tsx` - Main component
2. ✅ `lib/useUpgradeNudge.ts` - Hook logic
3. ✅ `app/dashboard/page.tsx` - Integration example

## Dependencies

```json
{
  "lucide-react": "^0.x.x",
  "next": "14.x.x",
  "react": "18.x.x"
}
```

## Environment Variables

- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - For checkout
- `STRIPE_SECRET_KEY` - For backend
- `STRIPE_PRICE_ID` - Pro plan price ID

---

**Status**: ✅ Implementation Complete
**Last Updated**: 2026-05-05
**Version**: 1.0.0
