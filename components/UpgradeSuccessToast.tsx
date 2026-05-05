"use client"

import { useEffect, useState } from "react"
import { CheckCircle, X } from "lucide-react"

interface UpgradeSuccessToastProps {
  show: boolean
  onClose: () => void
}

export default function UpgradeSuccessToast({
  show,
  onClose,
}: UpgradeSuccessToastProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (show) {
      setIsVisible(true)
      // Auto-dismiss after 5 seconds
      const timer = setTimeout(() => {
        handleClose()
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [show])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(onClose, 300) // Wait for animation to complete
  }

  if (!show) return null

  return (
    <div
      className={`fixed top-4 right-4 z-50 transition-all duration-300 ${
        isVisible
          ? "opacity-100 translate-y-0"
          : "opacity-0 -translate-y-2"
      }`}
    >
      <div className="bg-white rounded-lg shadow-2xl border border-green-200 p-4 min-w-[320px] max-w-md">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <CheckCircle className="w-6 h-6 text-green-500" />
          </div>
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-semibold text-gray-900">
              🎉 You're now on Pro plan!
            </h3>
            <p className="mt-1 text-sm text-gray-600">
              You now have unlimited meeting uploads and all Pro features.
            </p>
          </div>
          <button
            onClick={handleClose}
            className="ml-4 flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
