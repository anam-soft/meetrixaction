"use client"

import { X } from "lucide-react"
import { useState, useEffect } from "react"
import { trackUpgradeEvent } from "@/lib/analytics"

interface UpgradeBannerProps {
  currentUsage: number
  limit: number
  onUpgradeClick: () => void
}

export default function UpgradeBanner({
  currentUsage,
  limit,
  onUpgradeClick,
}: UpgradeBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false)

  useEffect(() => {
    // Track banner shown
    trackUpgradeEvent('banner_shown', {
      currentUsage,
      limit,
      source: 'banner',
    })
  }, [currentUsage, limit])

  if (isDismissed) return null

  const handleDismiss = () => {
    trackUpgradeEvent('banner_dismissed', {
      currentUsage,
      limit,
      source: 'banner',
    })
    setIsDismissed(true)
  }

  const handleUpgradeClick = () => {
    trackUpgradeEvent('upgrade_clicked', {
      currentUsage,
      limit,
      source: 'banner',
    })
    onUpgradeClick()
  }

  const remaining = limit - currentUsage
  const isWarning = remaining <= 1

  return (
    <div
      className={`relative ${
        isWarning
          ? "bg-gradient-to-r from-orange-500 to-red-500"
          : "bg-gradient-to-r from-purple-500 to-pink-500"
      } text-white rounded-lg p-4 mb-6 shadow-lg`}
    >
      <button
        onClick={handleDismiss}
        className="absolute top-3 right-3 text-white/80 hover:text-white transition-colors"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="flex items-center justify-between pr-8">
        <div className="flex-1">
          <h3 className="font-semibold text-lg mb-1">
            {isWarning
              ? "⚠️ Almost out of free meetings"
              : "📊 Usage Update"}
          </h3>
          <p className="text-white/90 text-sm">
            You've used {currentUsage} of {limit} free meetings this month.{" "}
            {remaining > 0 ? `${remaining} remaining.` : ""}
          </p>
        </div>

        <button
          onClick={handleUpgradeClick}
          className="bg-white text-purple-600 font-semibold px-6 py-2 rounded-lg hover:bg-gray-100 transition-colors whitespace-nowrap ml-4"
        >
          Upgrade to Pro
        </button>
      </div>
    </div>
  )
}
