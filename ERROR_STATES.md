# Error States Documentation

This document defines all error states in the application, their user-facing messages, and implementation guidelines.

## Overview

Error messages should be:
- **Clear**: Users understand what went wrong
- **Actionable**: Users know what to do next
- **Friendly**: Tone is helpful, not technical or blaming
- **Consistent**: Similar errors use similar language patterns

---

## Error Scenarios

### 1. File Too Large

**Trigger**: User attempts to upload a file over 200MB (free tier limit)

**User-facing message**:
```
"This file is over 200MB. Upgrade to Pro for unlimited file sizes."
```

**Implementation**:
- Check file size before upload starts
- Show error in upload modal
- Include "Upgrade to Pro" CTA button
- Log event: `file_too_large`

**Related files**:
- [`components/UploadModal.tsx`](components/UploadModal.tsx)
- [`app/api/meetings/route.ts`](app/api/meetings/route.ts)

---

### 2. Unsupported File Type

**Trigger**: User attempts to upload a file with unsupported format

**User-facing message**:
```
"We support MP3, WAV, MP4, MOV, AVI, and WebM files."
```

**Supported formats**:
- Audio: MP3, WAV
- Video: MP4, MOV, AVI, WebM

**Implementation**:
- Validate file extension and MIME type
- Show error immediately on file selection
- Display supported formats clearly
- Log event: `unsupported_file_type`

**Related files**:
- [`components/UploadModal.tsx`](components/UploadModal.tsx)
- [`components/UploadMeeting.tsx`](components/UploadMeeting.tsx)

---

### 3. Transcription Failed

**Trigger**: Transcription service fails to process the recording

**User-facing message**:
```
"We couldn't process this recording. Try a different file or paste the transcript manually."
```

**Common causes**:
- Corrupted audio/video file
- Poor audio quality
- Unsupported codec
- Service timeout
- API rate limits

**Implementation**:
- Show error after processing attempt
- Offer manual transcript paste option
- Provide "Try Again" button
- Log error details for debugging
- Log event: `transcription_failed`

**Related files**:
- [`app/api/meetings/[id]/process/route.ts`](app/api/meetings/[id]/process/route.ts)
- [`components/ProcessingState.tsx`](components/ProcessingState.tsx)

---

### 4. AI Extraction Failed

**Trigger**: OpenAI fails to extract tasks from transcript

**User-facing message**:
```
"Something went wrong extracting tasks. Please try again."
```

**Common causes**:
- OpenAI API error
- Invalid API key
- Rate limiting
- Malformed transcript
- Network timeout

**Implementation**:
- Show error in results view
- Provide "Retry" button
- Allow manual task creation
- Log error with context
- Log event: `ai_extraction_failed`

**Related files**:
- [`app/api/meetings/[id]/process/route.ts`](app/api/meetings/[id]/process/route.ts)
- [`lib/openai.ts`](lib/openai.ts)
- [`components/MeetingResults.tsx`](components/MeetingResults.tsx)

---

### 5. Meeting Limit Reached

**Trigger**: Free user attempts to create 6th meeting in current month

**User-facing message**:
```
"You've used all 5 free meetings this month. Upgrade to Pro for unlimited meetings."
```

**Implementation**:
- Check usage before allowing upload
- Show modal with upgrade CTA
- Display usage stats (e.g., "5/5 meetings used")
- Include pricing information
- Log event: `meeting_limit_reached`

**Related files**:
- [`components/UpgradeLimitModal.tsx`](components/UpgradeLimitModal.tsx)
- [`lib/usage.ts`](lib/usage.ts)
- [`app/api/meetings/route.ts`](app/api/meetings/route.ts)

---

### 6. Network Error

**Trigger**: Network connection lost during operation

**User-facing message**:
```
"Connection lost. Please check your internet and try again."
```

**Common scenarios**:
- Upload interrupted
- API request timeout
- WebSocket disconnection
- DNS resolution failure

**Implementation**:
- Detect network errors (fetch failures, timeouts)
- Show toast notification
- Provide "Retry" action
- Save draft state when possible
- Auto-retry with exponential backoff
- Log event: `network_error`

**Related files**:
- All API route files
- [`components/UploadModal.tsx`](components/UploadModal.tsx)
- [`components/ProcessingState.tsx`](components/ProcessingState.tsx)

---

## Error State Components

### Error Toast
For non-blocking errors that don't interrupt workflow:
```tsx
{
  type: 'error',
  title: 'Error title',
  message: 'User-facing message',
  action?: { label: 'Retry', onClick: () => {} }
}
```

### Error Modal
For blocking errors that require user action:
```tsx
<ErrorModal
  isOpen={true}
  title="Error title"
  message="User-facing message"
  primaryAction={{ label: 'Try Again', onClick: () => {} }}
  secondaryAction={{ label: 'Cancel', onClick: () => {} }}
/>
```

### Inline Error
For form validation and field-level errors:
```tsx
<div className="text-sm text-red-600 mt-1">
  Error message here
</div>
```

---

## Error Response Format

All API endpoints should return consistent error responses:

```typescript
// Success response
{
  success: true,
  data: { ... }
}

// Error response
{
  success: false,
  error: {
    code: 'ERROR_CODE',
    message: 'User-facing message',
    details?: { ... } // Optional technical details
  }
}
```

### Error Codes

| Code | Description |
|------|-------------|
| `FILE_TOO_LARGE` | File exceeds size limit |
| `UNSUPPORTED_FILE_TYPE` | File type not supported |
| `TRANSCRIPTION_FAILED` | Transcription service error |
| `AI_EXTRACTION_FAILED` | AI task extraction error |
| `MEETING_LIMIT_REACHED` | Free tier limit exceeded |
| `NETWORK_ERROR` | Network connectivity issue |
| `UNAUTHORIZED` | User not authenticated |
| `FORBIDDEN` | User lacks permission |
| `NOT_FOUND` | Resource not found |
| `RATE_LIMITED` | Too many requests |
| `SERVER_ERROR` | Internal server error |

---

## Implementation Checklist

When implementing error handling:

- [ ] Use appropriate error code
- [ ] Show user-friendly message
- [ ] Provide actionable next steps
- [ ] Log error for debugging
- [ ] Track analytics event
- [ ] Test error scenario
- [ ] Handle edge cases
- [ ] Consider retry logic
- [ ] Preserve user data when possible
- [ ] Update UI state appropriately

---

## Testing Error States

### Manual Testing
1. **File too large**: Upload 201MB file
2. **Unsupported type**: Upload .txt or .pdf file
3. **Transcription failed**: Upload corrupted audio file
4. **AI extraction failed**: Temporarily break OpenAI API key
5. **Meeting limit**: Create 6 meetings as free user
6. **Network error**: Disconnect internet during upload

### Automated Testing
```typescript
// Example test
it('shows error when file is too large', async () => {
  const largeFile = new File(['x'.repeat(201 * 1024 * 1024)], 'large.mp3');
  await uploadFile(largeFile);
  expect(screen.getByText(/over 200MB/i)).toBeInTheDocument();
  expect(screen.getByText(/Upgrade to Pro/i)).toBeInTheDocument();
});
```

---

## Analytics Events

Track these events for error monitoring:

```typescript
// Error event structure
{
  event: 'error_occurred',
  properties: {
    error_code: 'FILE_TOO_LARGE',
    error_message: 'User-facing message',
    context: 'upload_modal',
    user_tier: 'free',
    timestamp: '2026-05-05T22:16:26.681Z'
  }
}
```

---

## Future Enhancements

1. **Error Recovery**: Auto-save and resume interrupted uploads
2. **Smart Retry**: Exponential backoff with jitter
3. **Offline Mode**: Queue operations when offline
4. **Error Reporting**: Allow users to report persistent errors
5. **Contextual Help**: Link to help docs for each error type
6. **A/B Testing**: Test different error message variations

---

## Related Documentation

- [`UX_GUIDELINES.md`](UX_GUIDELINES.md) - Overall UX principles
- [`FEATURE_GATES.md`](FEATURE_GATES.md) - Free vs Pro feature limits
- [`CORE_PRODUCT_README.md`](CORE_PRODUCT_README.md) - Core product flows
- [`UPGRADE_SYSTEM_COMPLETE.md`](UPGRADE_SYSTEM_COMPLETE.md) - Upgrade system details

---

## Support

For questions about error handling implementation:
1. Check existing error handling patterns in codebase
2. Review this documentation
3. Test error scenarios thoroughly
4. Monitor error rates in production
