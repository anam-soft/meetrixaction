/**
 * Analytics tracking for upgrade flow
 * Track key conversion events throughout the upgrade funnel
 */

export type UpgradeEvent = 
  | 'limit_reached'
  | 'upgrade_modal_shown'
  | 'upgrade_modal_dismissed'
  | 'upgrade_clicked'
  | 'checkout_initiated'
  | 'checkout_completed'
  | 'checkout_canceled'
  | 'upgrade_success'
  | 'banner_shown'
  | 'banner_dismissed'
  | 'pricing_page_viewed'

interface UpgradeEventData {
  event: UpgradeEvent
  userId?: string
  currentUsage?: number
  limit?: number
  source?: 'modal' | 'banner' | 'dashboard' | 'meetings' | 'pricing'
  timestamp: string
}

/**
 * Track upgrade-related events
 */
export function trackUpgradeEvent(
  event: UpgradeEvent,
  data?: Partial<UpgradeEventData>
) {
  const eventData: UpgradeEventData = {
    event,
    timestamp: new Date().toISOString(),
    ...data,
  }

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log('📊 Upgrade Event:', eventData)
  }

  // Send to analytics service (e.g., Google Analytics, Mixpanel, PostHog)
  if (typeof window !== 'undefined') {
    // Google Analytics 4
    if ((window as any).gtag) {
      (window as any).gtag('event', event, {
        event_category: 'upgrade',
        event_label: data?.source,
        value: data?.currentUsage,
      })
    }

    // PostHog
    if ((window as any).posthog) {
      (window as any).posthog.capture(event, eventData)
    }

    // Custom analytics endpoint
    fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventData),
    }).catch((error) => {
      console.error('Failed to track event:', error)
    })
  }
}

/**
 * Track conversion funnel step
 */
export function trackConversionStep(
  step: 'awareness' | 'consideration' | 'decision' | 'action' | 'retention',
  data?: Record<string, any>
) {
  trackUpgradeEvent('upgrade_clicked', {
    source: data?.source,
    ...data,
  })
}

/**
 * Calculate and track conversion metrics
 */
export async function trackConversionMetrics() {
  try {
    const response = await fetch('/api/analytics/metrics')
    const metrics = await response.json()

    if (process.env.NODE_ENV === 'development') {
      console.log('📈 Conversion Metrics:', metrics)
    }

    return metrics
  } catch (error) {
    console.error('Failed to fetch conversion metrics:', error)
    return null
  }
}
