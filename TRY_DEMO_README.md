# MeetRix Action - `/try` Demo Page

## Overview

The `/try` page is the **most important page for user activation** according to the PRD. It allows visitors to experience the product in 60 seconds with zero friction - no account required.

## Features Implemented

### 1. Three-Step Flow

#### Step 1: Input Screen
- Large textarea for pasting meeting transcripts
- Three pre-built sample transcripts (Daily standup, Design review, Sprint planning)
- Sample pills that auto-fill the textarea when clicked
- Clear messaging: "Try it free — no account needed"
- Privacy notice: "Your data is not stored. Results disappear when you close this tab."

#### Step 2: Processing Screen
- Animated progress with 4 steps:
  1. Reading transcript
  2. Identifying speakers and topics
  3. Extracting action items with owners
  4. Detecting deadlines and priorities
- Visual progress bar (0-100%)
- Checkmarks appear as each step completes
- Smooth 3-second animation

#### Step 3: Results Screen
- Meeting title and metadata
- AI-generated summary (2-3 sentences)
- Task list with:
  - Priority dots (red=high, amber=medium, green=low)
  - Assignee badges
  - Due date badges
  - Priority level badges
- Key decisions list
- Sign-up nudge card with:
  - Stats pills (tasks extracted, owners assigned, items missed)
  - Clear value proposition
  - "Start free — 5 meetings included" CTA
  - "Try another transcript" option

## Technical Implementation

### API Endpoint
**Route:** `/api/demo/extract`
**Method:** POST
**Body:** `{ transcript: string }`

Uses Anthropic Claude API (`claude-sonnet-4-20250514`) with a specialized system prompt for extracting:
- Meeting title
- Summary
- Tasks (with assignee, due date, priority)
- Key decisions
- Participants

### Components Created

1. **`app/try/page.tsx`** - Main demo page component
   - Manages 3-step state machine
   - Handles API calls
   - Animated transitions with Framer Motion

2. **`app/api/demo/extract/route.ts`** - Claude API integration
   - Validates input
   - Calls Anthropic API
   - Parses and returns structured JSON

3. **`lib/sample-transcripts.ts`** - Sample data
   - Three realistic meeting transcripts
   - Typed exports for type safety

## Environment Variables Required

```bash
# Required for /try demo page to work
ANTHROPIC_API_KEY="sk-ant-your_anthropic_api_key_here"
```

Get your API key from: https://console.anthropic.com/

## User Flow

1. User lands on homepage
2. Clicks "Try it free — no signup needed" button
3. Arrives at `/try` page
4. Either:
   - Pastes their own transcript, OR
   - Clicks a sample pill to auto-fill
5. Clicks "Extract action items"
6. Watches 3-second processing animation
7. Sees extracted tasks with full details
8. Sees sign-up nudge with clear value prop
9. Either:
   - Signs up (converts to user), OR
   - Tries another transcript (continues exploring)

## Key UX Principles Followed

✅ **Zero friction** - No account required to see results
✅ **Instant value** - Results in ~5 seconds
✅ **Clear privacy** - "Data not stored" message
✅ **Earned upgrade** - Sign-up nudge appears AFTER showing value
✅ **Sample data** - Three realistic examples for quick testing
✅ **Visual feedback** - Animated progress, not blank loading screens
✅ **Mobile responsive** - Works on all screen sizes

## Testing the Demo

### Manual Test
1. Navigate to `http://localhost:3000/try`
2. Click "Daily standup" sample pill
3. Click "Extract action items"
4. Verify processing animation runs smoothly
5. Verify results show:
   - Meeting title
   - Summary paragraph
   - Multiple tasks with badges
   - Sign-up nudge at bottom

### API Test
```bash
curl -X POST http://localhost:3000/api/demo/extract \
  -H "Content-Type: application/json" \
  -d '{"transcript":"Team meeting: Alex will finish the report by Friday. Sarah needs to review it by Monday."}'
```

Expected response:
```json
{
  "title": "Team meeting - [date]",
  "summary": "...",
  "tasks": [
    {
      "name": "Finish the report",
      "assignee": "Alex",
      "due_text": "Friday",
      "priority": "medium"
    },
    {
      "name": "Review the report",
      "assignee": "Sarah",
      "due_text": "Monday",
      "priority": "medium"
    }
  ],
  "decisions": [],
  "participants": ["Alex", "Sarah"]
}
```

## Integration with Landing Page

The landing page now has two primary CTAs:
1. **"Try it free — no signup needed"** → `/try` (primary CTA)
2. **"Start free account"** → Sign up modal (secondary CTA)

This follows the PRD's guidance to prioritize the demo experience.

## Error Handling

- Empty transcript → "Please paste a transcript or select a sample"
- API failure → "Something went wrong extracting tasks. Please try again."
- JSON parse error → "Failed to parse AI response. Please try again."
- All errors reset to input step for easy retry

## Performance Considerations

- Processing animation runs for minimum 3 seconds to feel substantial
- API call happens in parallel with animation
- Results only show after both complete
- No data persistence (privacy-first, no database writes)

## Future Enhancements (Not in MVP)

- File upload support (audio/video)
- Real-time transcription with Whisper
- Export results as PDF
- Share results via link
- Compare multiple transcripts
- Analytics tracking (conversion rate from demo to signup)

## Success Metrics to Track

1. **Demo completion rate** - % who complete all 3 steps
2. **Sample vs custom** - % using samples vs pasting own content
3. **Demo to signup conversion** - % who sign up after seeing results
4. **Retry rate** - % who try multiple transcripts

---

**Status:** ✅ Fully implemented and ready for testing
**Priority:** 🔥 Critical for user activation
**Dependencies:** Anthropic API key required
