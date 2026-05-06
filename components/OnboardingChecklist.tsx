"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, Circle, Sparkles, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  action?: () => void;
  actionLabel?: string;
}

interface OnboardingChecklistProps {
  onComplete?: () => void;
}

export default function OnboardingChecklist({ onComplete }: OnboardingChecklistProps) {
  const [steps, setSteps] = useState<OnboardingStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    fetchProgress();
  }, []);

  const fetchProgress = async () => {
    try {
      const response = await fetch("/api/onboarding/progress");
      const data = await response.json();
      
      setSteps([
        {
          id: "upload_meeting",
          title: "Upload your first meeting",
          description: "Upload a recording or paste a transcript",
          completed: data.hasUploadedMeeting || false,
          action: () => window.location.href = "/dashboard/meetings",
          actionLabel: "Upload now",
        },
        {
          id: "review_tasks",
          title: "Review your extracted tasks",
          description: "See what AI found in your meeting",
          completed: data.hasReviewedTasks || false,
          action: () => window.location.href = "/dashboard/tasks",
          actionLabel: "View tasks",
        },
        {
          id: "invite_teammate",
          title: "Invite a teammate",
          description: "Collaborate with your team",
          completed: data.hasInvitedTeammate || false,
          action: () => window.location.href = "/dashboard/team",
          actionLabel: "Invite team",
        },
        {
          id: "complete_task",
          title: "Mark your first task as done",
          description: "Experience the satisfaction of completion",
          completed: data.hasCompletedTask || false,
          action: () => window.location.href = "/dashboard/tasks",
          actionLabel: "Go to tasks",
        },
      ]);

      // Check if all completed
      const allCompleted = [
        data.hasUploadedMeeting,
        data.hasReviewedTasks,
        data.hasInvitedTeammate,
        data.hasCompletedTask,
      ].every(Boolean);

      if (allCompleted && !data.onboardingDismissed) {
        setShowCelebration(true);
      }

      setDismissed(data.onboardingDismissed || false);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = async () => {
    try {
      await fetch("/api/onboarding/dismiss", { method: "POST" });
      setDismissed(true);
      onComplete?.();
    } catch (error) {
    }
  };

  const handleCelebrationClose = () => {
    setShowCelebration(false);
    handleDismiss();
  };

  if (loading || dismissed) return null;

  const completedCount = steps.filter(s => s.completed).length;
  const totalSteps = steps.length;
  const progress = (completedCount / totalSteps) * 100;
  const allCompleted = completedCount === totalSteps;

  return (
    <>
      {/* Celebration Modal */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gradient-to-br from-gray-900 via-gray-900 to-purple-900/20 border border-white/10 rounded-2xl shadow-2xl max-w-md w-full p-8 text-center"
            >
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-2xl opacity-30 animate-pulse" />
                <div className="relative w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto">
                  <Sparkles className="w-10 h-10 text-white" />
                </div>
              </div>

              <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                You're all set!
              </h2>
              <p className="text-gray-300 mb-6">
                You've completed all onboarding steps. You're ready to get the most out of MeetRix Action!
              </p>

              <button
                onClick={handleCelebrationClose}
                className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105"
              >
                Start using MeetRix Action
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Checklist Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6 border-2 border-purple-500/30"
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Getting Started</h3>
              <p className="text-sm text-muted-foreground">
                {completedCount} of {totalSteps} completed
              </p>
            </div>
          </div>
          {allCompleted && (
            <button
              onClick={handleDismiss}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              title="Dismiss"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-purple-600 to-pink-600"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-3">
          {steps.map((step, index) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${
                step.completed
                  ? "bg-green-500/10 border border-green-500/20"
                  : "bg-white/5 border border-white/10 hover:border-white/20"
              }`}
            >
              <div className="flex-shrink-0 mt-0.5">
                {step.completed ? (
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                ) : (
                  <Circle className="w-5 h-5 text-gray-500" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h4
                  className={`font-medium mb-1 ${
                    step.completed ? "text-green-400 line-through" : "text-white"
                  }`}
                >
                  {step.title}
                </h4>
                <p className="text-sm text-muted-foreground mb-2">
                  {step.description}
                </p>

                {!step.completed && step.action && step.actionLabel && (
                  <button
                    onClick={step.action}
                    className="text-sm text-purple-400 hover:text-purple-300 font-medium transition-colors"
                  >
                    {step.actionLabel} →
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {allCompleted && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-4 bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-lg text-center"
          >
            <p className="text-sm text-purple-300 font-medium">
              🎉 All steps completed! You're ready to go.
            </p>
          </motion.div>
        )}
      </motion.div>
    </>
  );
}
