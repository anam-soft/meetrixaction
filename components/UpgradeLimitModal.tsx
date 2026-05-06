"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { trackUpgradeEvent } from "@/lib/analytics"

interface UpgradeLimitModalProps {
  isOpen: boolean
  onClose: () => void
  currentUsage: number
  limit: number
}

export default function UpgradeLimitModal({
  isOpen,
  onClose,
  currentUsage,
  limit,
}: UpgradeLimitModalProps) {
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      // Track modal shown
      trackUpgradeEvent('upgrade_modal_shown', {
        currentUsage,
        limit,
        source: 'modal',
      })
    }
  }, [isOpen, currentUsage, limit])

  if (!isOpen) return null

  const handleClose = () => {
    trackUpgradeEvent('upgrade_modal_dismissed', {
      currentUsage,
      limit,
      source: 'modal',
    })
    onClose()
  }

  const handleUpgrade = async () => {
    trackUpgradeEvent('upgrade_clicked', {
      currentUsage,
      limit,
      source: 'modal',
    })

    setIsLoading(true)
    try {
      trackUpgradeEvent('checkout_initiated', {
        currentUsage,
        limit,
        source: 'modal',
      })
      // Get Stripe price ID from environment
      const priceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID
      
      if (!priceId) {
        alert("Stripe is not configured. Please contact support.")
        return
      }

      // Create checkout session
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ priceId }),
      })

      const data = await response.json()

      if (data.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url
      } else {
        alert("Failed to create checkout session. Please try again.")
        setIsLoading(false)
      }
    } catch (error) {
      alert("Something went wrong. Please try again.")
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-md mx-4 bg-white rounded-2xl shadow-2xl">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          disabled={isLoading}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content */}
        <div className="p-8">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">
            You've reached your free limit
          </h2>

          {/* Subtitle */}
          <p className="text-center text-gray-600 mb-6">
            You've used {currentUsage} of {limit} free meetings this month.
            Upgrade to Pro for unlimited meetings.
          </p>

          {/* Features */}
          <div className="space-y-3 mb-8">
            <div className="flex items-start">
              <svg
                className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-gray-700">Unlimited meeting uploads</span>
            </div>
            <div className="flex items-start">
              <svg
                className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-gray-700">AI-powered summaries & tasks</span>
            </div>
            <div className="flex items-start">
              <svg
                className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-gray-700">Priority support</span>
            </div>
            <div className="flex items-start">
              <svg
                className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-gray-700">Cancel anytime</span>
            </div>
          </div>

          {/* Pricing */}
          <div className="text-center mb-6">
            <div className="text-4xl font-bold text-gray-900">
              $29<span className="text-lg text-gray-600">/month</span>
            </div>
          </div>

          {/* CTAs */}
          <div className="space-y-3">
            <button
              onClick={handleUpgrade}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Redirecting..." : "Upgrade to Pro"}
            </button>
            <button
              onClick={onClose}
              disabled={isLoading}
              className="w-full bg-gray-100 text-gray-700 font-semibold py-3 px-6 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Maybe later
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
