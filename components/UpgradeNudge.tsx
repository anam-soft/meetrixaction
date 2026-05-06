"use client";

import { useState } from "react";
import { X, Sparkles, TrendingUp, Zap } from "lucide-react";
import { useRouter } from "next/navigation";

interface UpgradeNudgeProps {
  show: boolean;
  onClose: () => void;
  trigger: "meeting-limit" | "team-limit" | "pro-feature";
  currentUsage?: number;
  limit?: number;
  featureName?: string;
}

export default function UpgradeNudge({
  show,
  onClose,
  trigger,
  currentUsage = 0,
  limit = 5,
  featureName = "this feature",
}: UpgradeNudgeProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Failed to create checkout session:", error);
      setLoading(false);
    }
  };

  if (!show) return null;

  // Determine message based on trigger
  const getMessage = () => {
    switch (trigger) {
      case "meeting-limit":
        const remaining = limit - currentUsage;
        if (remaining === 1) {
          return {
            title: "You have 1 free meeting left",
            description: `You've used ${currentUsage} of your ${limit} free meetings this month. Upgrade to Pro for unlimited meetings and advanced features.`,
            icon: <TrendingUp className="w-6 h-6" />,
          };
        } else if (remaining === 0) {
          return {
            title: "You've reached your meeting limit",
            description: `You've used all ${limit} free meetings this month. Upgrade to Pro to continue uploading meetings and unlock unlimited access.`,
            icon: <Zap className="w-6 h-6" />,
          };
        }
        return {
          title: `${remaining} free meetings remaining`,
          description: `You've used ${currentUsage} of your ${limit} free meetings this month. Upgrade to Pro for unlimited meetings.`,
          icon: <TrendingUp className="w-6 h-6" />,
        };

      case "team-limit":
        return {
          title: "Upgrade to add more team members",
          description: "Free plan is limited to 2 team members. Upgrade to Pro for unlimited team collaboration and advanced features.",
          icon: <Sparkles className="w-6 h-6" />,
        };

      case "pro-feature":
        return {
          title: `${featureName} is a Pro feature`,
          description: "Upgrade to Pro to unlock this feature along with unlimited meetings, team collaboration, and priority support.",
          icon: <Sparkles className="w-6 h-6" />,
        };

      default:
        return {
          title: "Upgrade to Pro",
          description: "Unlock unlimited meetings, team collaboration, and advanced features.",
          icon: <Sparkles className="w-6 h-6" />,
        };
    }
  };

  const { title, description, icon } = getMessage();

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-gradient-to-br from-gray-900 via-gray-900 to-purple-900/20 border border-white/10 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Header with gradient */}
        <div className="relative bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-purple-600/20 p-6 border-b border-white/10">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-pink-600/10 animate-pulse" />
          <div className="relative flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center flex-shrink-0">
                {icon}
              </div>
              <div>
                <h2 className="text-xl font-bold text-white mb-1">{title}</h2>
                {trigger === "meeting-limit" && (
                  <div className="flex items-center gap-2 text-sm">
                    <div className="flex-1 bg-white/10 rounded-full h-2 overflow-hidden max-w-[200px]">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                        style={{ width: `${(currentUsage / limit) * 100}%` }}
                      />
                    </div>
                    <span className="text-gray-400 font-medium">
                      {currentUsage}/{limit}
                    </span>
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <p className="text-gray-300 leading-relaxed">{description}</p>

          {/* Pro Features List */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
              Pro Features Include:
            </h3>
            <div className="grid grid-cols-1 gap-2">
              {[
                "Unlimited meetings per month",
                "Unlimited team members",
                "Advanced AI insights & summaries",
                "Priority email support",
                "Custom integrations",
                "Export to your favorite tools",
              ].map((feature, index) => (
                <div key={index} className="flex items-center gap-3 text-sm">
                  <div className="w-5 h-5 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-3 h-3 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <span className="text-gray-300">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-gradient-to-br from-purple-600/10 to-pink-600/10 border border-purple-500/20 rounded-xl p-4">
            <div className="flex items-baseline justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">Upgrade to Pro</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-white">$29</span>
                  <span className="text-gray-400">/month</span>
                </div>
              </div>
              <div className="text-right">
                <span className="inline-block px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-semibold">
                  Save 20% yearly
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleUpgrade}
              disabled={loading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 disabled:hover:scale-100 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Upgrade to Pro
                </>
              )}
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl font-medium transition-colors"
            >
              Maybe later
            </button>
          </div>

          {/* Trust badges */}
          <div className="flex items-center justify-center gap-6 pt-4 border-t border-white/10">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                  clipRule="evenodd"
                />
              </svg>
              Secure payment
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" />
              </svg>
              Cancel anytime
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
