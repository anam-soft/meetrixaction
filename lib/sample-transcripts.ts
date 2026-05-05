export const SAMPLE_TRANSCRIPTS = {
  standup: `Daily standup – May 5, 2026

Alex: Finished the auth bug fix yesterday, PR is up for review. Today I'll start on the notification service. Blocked on the API docs from Sarah.

Sarah: Working on the API documentation, should be done by end of day. Also need to sync with Mike about the database schema changes.

Mike: Reviewed two PRs yesterday. Today I'll update the database schema and send Sarah the updated specs by noon. Also need to schedule the QA session for Thursday.

Team agreed: demo to stakeholders moved to Friday at 3pm. Mike to send calendar invite.`,

  design: `Design Review – Product team

Attendees: Priya (design lead), James (eng), Lena (PM)

Priya walked through the new onboarding flow. James flagged that the three-step wizard adds complexity on mobile — agreed to simplify to a single screen for v1. Lena to update the PRD with revised scope by Wednesday.

Dashboard redesign approved with minor changes: James will reduce card padding and update font sizes to match the design system. Target: merged by Friday.

Dark mode toggle deprioritised — pushed to next sprint. Priya to archive Figma frames and add to backlog.

API response times flagged as a blocker for the live preview feature. James to investigate and report back by Thursday EOD.`,

  planning: `Sprint planning – Engineering

Sprint goal: ship the billing integration and close out the remaining onboarding bugs.

Tasks assigned:
- Tom: integrate Stripe webhooks for subscription events. Estimate 3 days. Due by Wednesday.
- Nina: fix the mobile signup form bug (ticket #204). Should be quick, target tomorrow.
- Tom + Nina: pair on the billing dashboard UI Thursday afternoon.
- Carlos: write unit tests for the new payment service. Due end of sprint.
- All: update Jira tickets before standup each morning.

Carlos raised a concern about test coverage in the auth module — agreed to add a tech debt ticket. Nina to create it today.`,
}

export type SampleType = keyof typeof SAMPLE_TRANSCRIPTS
