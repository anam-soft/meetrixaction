# MeetRix Action - UX Guidelines

## Core UX Principles

These rules ensure a delightful, friction-free user experience that prioritizes value delivery and user trust.

---

## 1. Zero-Friction Demo Experience

### Rule: The /try page must work with zero account

**Implementation:**
- ✅ No authentication required
- ✅ No redirects to signup before showing results
- ✅ Process transcript immediately
- ✅ Show full results without login
- ✅ Sign-up nudge appears AFTER results, never before

**Why:** Users need to experience value before committing. Let them see the magic first.

**Example Flow:**
```
User lands on /try
  → Pastes transcript
  → Clicks "Extract Tasks"
  → Sees processing animation
  → Views full results (tasks, summary, decisions)
  → THEN sees "Save these tasks? Sign up free"
```

**Anti-Pattern ❌:**
```
User lands on /try
  → Pastes transcript
  → Clicks "Extract Tasks"
  → Redirected to signup ← WRONG!
```

---

## 2. Always Show Loading States

### Rule: Every AI call has a visible progress indicator

**Implementation:**
- ✅ Animated spinners for API calls
- ✅ Step-by-step progress for multi-stage processes
- ✅ Skeleton loaders for content loading
- ✅ Progress bars for file uploads
- ✅ Status messages ("Analyzing...", "Extracting tasks...")

**Why:** AI processing takes time. Users need feedback that something is happening.

**Components:**
- [`ProcessingState.tsx`](components/ProcessingState.tsx:1) - Multi-step progress
- [`UploadModal.tsx`](components/UploadModal.tsx:1) - File upload progress
- Loading spinners in all API-dependent components

**Example:**
```tsx
{loading ? (
  <div className="flex items-center gap-2">
    <Loader2 className="w-5 h-5 animate-spin" />
    <span>Analyzing transcript...</span>
  </div>
) : (
  <Results data={data} />
)}
```

---

## 3. Meaningful Empty States

### Rule: Every empty list has an illustration, message, and CTA

**Implementation:**
- ✅ Never show blank screens
- ✅ Use relevant icons (large, muted)
- ✅ Friendly, helpful message
- ✅ Clear call-to-action
- ✅ Contextual guidance

**Why:** Empty states are opportunities to guide users, not dead ends.

**Template:**
```tsx
<div className="text-center py-12">
  <Icon className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
  <h3 className="text-xl font-semibold mb-2">
    {emptyStateTitle}
  </h3>
  <p className="text-muted-foreground mb-6">
    {emptyStateDescription}
  </p>
  <button className="cta-button">
    {emptyStateCTA}
  </button>
</div>
```

**Examples:**

**No Meetings:**
```
Icon: 📁 FileAudio
Title: "No meetings yet"
Message: "Upload your first meeting to get started with AI-powered task extraction"
CTA: "Upload Meeting"
```

**No Tasks:**
```
Icon: ✅ CheckCircle2
Title: "No tasks found"
Message: "Upload a meeting recording or paste a transcript to extract action items"
CTA: "Try Demo"
```

**No Overdue Tasks:**
```
Icon: ✅ CheckCircle2 (green)
Title: "No overdue tasks — great work!"
Message: "Your team is on track with all deadlines"
CTA: None (positive state)
```

---

## 4. Mobile-First Design

### Rule: Every page must be fully usable on a 375px screen

**Implementation:**
- ✅ Responsive layouts (grid → stack)
- ✅ Touch-friendly targets (min 44x44px)
- ✅ Readable font sizes (min 16px for body)
- ✅ Horizontal scrolling for tables
- ✅ Sticky mobile CTAs
- ✅ Collapsible sections on mobile

**Why:** 60%+ of users browse on mobile. Desktop-only design loses users.

**Breakpoints:**
```css
/* Mobile first */
.container { /* 375px+ */ }

@media (min-width: 640px) { /* sm */ }
@media (min-width: 768px) { /* md */ }
@media (min-width: 1024px) { /* lg */ }
@media (min-width: 1280px) { /* xl */ }
```

**Mobile Patterns:**
```tsx
{/* Desktop: 3 columns, Mobile: 1 column */}
<div className="grid grid-cols-1 md:grid-cols-3 gap-4">

{/* Desktop: horizontal, Mobile: vertical */}
<div className="flex flex-col md:flex-row gap-4">

{/* Hide on mobile */}
<div className="hidden md:block">

{/* Show only on mobile */}
<div className="block md:hidden">
```

**Testing:**
- Chrome DevTools responsive mode
- Test at 375px, 768px, 1024px
- Test touch interactions
- Test with slow 3G network

---

## 5. Human-Friendly Errors

### Rule: API errors show friendly messages, never raw error objects

**Implementation:**
- ✅ Translate technical errors to user language
- ✅ Provide actionable next steps
- ✅ Use friendly tone
- ✅ Show support contact for critical errors
- ✅ Log technical details server-side only

**Why:** Users don't care about 500 errors. They want to know what went wrong and how to fix it.

**Error Translation Map:**
```typescript
const errorMessages = {
  // Network errors
  "Failed to fetch": "Connection lost. Please check your internet and try again.",
  "NetworkError": "Can't reach our servers. Please check your connection.",
  
  // Auth errors
  "Unauthorized": "Your session expired. Please log in again.",
  "Invalid token": "Your session expired. Please log in again.",
  
  // Usage limits
  "Usage limit reached": "You've reached your monthly limit. Upgrade to Pro for unlimited access.",
  "File too large": "File exceeds 200MB limit. Upgrade to Pro for unlimited file size.",
  
  // Processing errors
  "Transcription failed": "We couldn't process your audio. Please try a different file format.",
  "AI extraction failed": "We couldn't extract tasks from this transcript. Please try again.",
  
  // Default
  "default": "Something went wrong. Please try again or contact support if the issue persists."
};
```

**Implementation:**
```tsx
try {
  const response = await fetch("/api/meetings", { method: "POST", body });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to upload meeting");
  }
} catch (error) {
  // Show friendly message
  setError(
    error.message === "Usage limit reached"
      ? "You've reached your 5 free meetings this month. Upgrade to Pro for unlimited meetings."
      : "We couldn't upload your meeting. Please try again."
  );
  
  // Log technical details
  console.error("Upload failed:", error);
}
```

**Error Display:**
```tsx
{error && (
  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
    <div className="flex items-start gap-3">
      <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
      <div>
        <p className="text-sm text-red-800 font-medium">{error}</p>
        {showSupport && (
          <a href="mailto:support@meetrixaction.com" className="text-sm text-red-600 underline mt-2 inline-block">
            Contact support
          </a>
        )}
      </div>
    </div>
  </div>
)}
```

---

## 6. Earned Upgrade Nudges

### Rule: Only show upgrade prompts after the user has experienced value

**Implementation:**
- ✅ Show nudge after 4th meeting upload
- ✅ Show nudge when trying to add 3rd team member
- ✅ Show nudge when accessing pro features
- ✅ Never show on first visit
- ✅ Respect dismissal cooldowns (1 hour)

**Why:** Premature upgrade prompts feel pushy. Let users see value first.

**Trigger Points:**
```typescript
// ✅ Good: After experiencing value
- User uploads 4th meeting → "You have 1 free meeting left"
- User tries to invite 3rd member → "Upgrade for unlimited team"
- User clicks "Email Digest" → "Email digests are a Pro feature"

// ❌ Bad: Before experiencing value
- User lands on homepage → Popup "Upgrade to Pro!"
- User creates account → "Upgrade now for 20% off"
- User views empty dashboard → "Go Pro today!"
```

**Implementation:**
See [`UpgradeNudge.tsx`](components/UpgradeNudge.tsx:1) and [`useUpgradeNudge.ts`](lib/useUpgradeNudge.ts:1)

---

## 7. Tasks Are Primary

### Rule: Navigation and metrics should always highlight task completion, not meeting count

**Implementation:**
- ✅ Dashboard shows task stats prominently
- ✅ Navigation emphasizes "Tasks" over "Meetings"
- ✅ Metrics focus on completion rate
- ✅ Notifications about task deadlines
- ✅ Weekly digest highlights task completion

**Why:** Users care about getting things done, not how many meetings they've had.

**Dashboard Hierarchy:**
```
1. Task Completion Rate (primary metric)
2. Tasks Completed This Week
3. Overdue Tasks (urgent)
4. Meetings This Month (secondary)
```

**Navigation Order:**
```
Dashboard
Tasks ← Prominent
Meetings
Team
Settings
```

**Metrics Priority:**
```tsx
// ✅ Good: Task-focused
<StatCard
  icon={<CheckCircle2 />}
  value={`${completionRate}%`}
  label="Task Completion Rate"
  primary
/>

// ❌ Bad: Meeting-focused
<StatCard
  icon={<FileAudio />}
  value={meetingCount}
  label="Meetings Uploaded"
  primary
/>
```

---

## 8. Post-Value Sign-Up Nudge

### Rule: The sign-up nudge on /try appears after results, never before

**Implementation:**
- ✅ User sees full demo results first
- ✅ Sign-up CTA appears below results
- ✅ Message emphasizes saving/tracking tasks
- ✅ No blocking modals before results
- ✅ Gentle, value-focused messaging

**Why:** Users need proof before commitment. Show them the magic, then ask for signup.

**Flow:**
```
/try page
  ↓
User pastes transcript
  ↓
Processing animation (no auth required)
  ↓
Full results displayed:
  - Tasks extracted
  - Meeting summary
  - Key decisions
  ↓
Sign-up CTA appears:
  "Want to save these tasks? Sign up free to track and manage them."
  [Sign Up Free] [Continue Exploring]
```

**CTA Placement:**
```tsx
<div className="space-y-6">
  {/* Results shown first */}
  <MeetingResults tasks={tasks} summary={summary} />
  
  {/* Sign-up nudge after results */}
  <div className="glass-card p-6 text-center border-2 border-purple-500/30">
    <Sparkles className="w-12 h-12 text-purple-400 mx-auto mb-4" />
    <h3 className="text-xl font-bold mb-2">
      Want to save these tasks?
    </h3>
    <p className="text-muted-foreground mb-6">
      Sign up free to track, assign, and manage your action items
    </p>
    <div className="flex gap-3 justify-center">
      <Link href="/register" className="btn-primary">
        Sign Up Free
      </Link>
      <button className="btn-secondary">
        Try Another Transcript
      </button>
    </div>
  </div>
</div>
```

---

## Implementation Checklist

### For Every New Feature:

- [ ] **Loading States**: Added spinner/progress for all async operations?
- [ ] **Empty States**: Designed empty state with icon, message, CTA?
- [ ] **Mobile**: Tested on 375px screen?
- [ ] **Errors**: Translated technical errors to friendly messages?
- [ ] **Upgrade Nudges**: Only shown after user experiences value?
- [ ] **Task Focus**: Emphasized task completion over meeting count?
- [ ] **No Auth Walls**: Demo features work without login?
- [ ] **Sign-up Timing**: Sign-up prompts appear after value delivery?

---

## Component Library

### Loading States
- `<Loader2 className="animate-spin" />` - Spinner
- `<ProcessingState steps={steps} />` - Multi-step progress
- Skeleton loaders for content

### Empty States
- Icon (16x16, muted, opacity-50)
- Title (text-xl, font-semibold)
- Description (text-muted-foreground)
- CTA button (btn-primary)

### Error States
- Red background (bg-red-50)
- AlertCircle icon
- Friendly message
- Optional support link

### Mobile Components
- `<StickyMobileCTA />` - Bottom sticky button
- Responsive grids (grid-cols-1 md:grid-cols-3)
- Touch-friendly buttons (min-h-[44px])

---

## Testing Guidelines

### Before Shipping:

1. **Demo Flow**: Can I use /try without an account?
2. **Loading**: Do I see feedback during all AI calls?
3. **Empty**: Are all empty states helpful and actionable?
4. **Mobile**: Does it work on iPhone SE (375px)?
5. **Errors**: Are error messages human-friendly?
6. **Upgrade**: Do nudges appear at the right time?
7. **Tasks**: Are tasks more prominent than meetings?
8. **Sign-up**: Does it appear after value delivery?

---

## Examples from Codebase

### ✅ Good Examples:

**Try Page** (`app/try/page.tsx`)
- No auth required
- Full results shown
- Sign-up CTA after results

**Upload Modal** (`components/UploadModal.tsx`)
- Multi-step progress animation
- Clear status indicators
- Friendly error messages

**Dashboard** (`app/dashboard/page.tsx`)
- Task completion rate prominent
- Empty states with CTAs
- Upgrade nudge after usage

### ❌ Anti-Patterns to Avoid:

```tsx
// ❌ No loading state
const data = await fetch("/api/data");
return <Results data={data} />;

// ❌ Blank empty state
{items.length === 0 && <div>No items</div>}

// ❌ Raw error
catch (error) {
  alert(error.toString());
}

// ❌ Premature upgrade
useEffect(() => {
  showUpgradeModal(); // On page load!
}, []);
```

---

## Resources

- [Mobile Testing](https://developers.google.com/web/tools/chrome-devtools/device-mode)
- [Touch Target Sizes](https://web.dev/accessible-tap-targets/)
- [Error Message Guidelines](https://www.nngroup.com/articles/error-message-guidelines/)
- [Empty State Design](https://www.nngroup.com/articles/empty-state-design/)

---

**Remember**: Every interaction should feel smooth, helpful, and respectful of the user's time. When in doubt, prioritize user value over business metrics.
