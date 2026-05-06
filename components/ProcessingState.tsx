"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Loader2,
  FileAudio,
  FileText,
  CheckCircle2,
  Sparkles,
  Brain,
  ListTodo,
} from "lucide-react"

interface ProcessingStateProps {
  meetingId: string
  onComplete: () => void
}

type ProcessingStep = {
  id: string
  label: string
  icon: typeof FileAudio
  status: "pending" | "processing" | "completed"
}

export default function ProcessingState({
  meetingId,
  onComplete,
}: ProcessingStateProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [partialResults, setPartialResults] = useState<{
    transcript?: string
    summary?: string
    tasksCount?: number
  }>({})

  const steps: ProcessingStep[] = [
    {
      id: "transcribe",
      label: "Transcribing audio",
      icon: FileAudio,
      status: "processing",
    },
    {
      id: "summarize",
      label: "Generating summary",
      icon: FileText,
      status: "pending",
    },
    {
      id: "extract",
      label: "Extracting action items",
      icon: ListTodo,
      status: "pending",
    },
    {
      id: "analyze",
      label: "Analyzing insights",
      icon: Brain,
      status: "pending",
    },
  ]

  const [processingSteps, setProcessingSteps] = useState(steps)

  useEffect(() => {
    // Poll for meeting status
    const pollInterval = setInterval(async () => {
      try {
        const res = await fetch(`/api/meetings?id=${meetingId}`)
        const data = await res.json()
        const meeting = data.meetings?.[0]

        if (!meeting) return

        // Update partial results
        if (meeting.transcript && !partialResults.transcript) {
          setPartialResults((prev) => ({ ...prev, transcript: meeting.transcript }))
          updateStepStatus(0, "completed")
          updateStepStatus(1, "processing")
          setCurrentStep(1)
        }

        if (meeting.summary && !partialResults.summary) {
          setPartialResults((prev) => ({ ...prev, summary: meeting.summary }))
          updateStepStatus(1, "completed")
          updateStepStatus(2, "processing")
          setCurrentStep(2)
        }

        if (meeting.tasks && meeting.tasks.length > 0 && !partialResults.tasksCount) {
          setPartialResults((prev) => ({ ...prev, tasksCount: meeting.tasks.length }))
          updateStepStatus(2, "completed")
          updateStepStatus(3, "processing")
          setCurrentStep(3)
        }

        // Check if complete
        if (meeting.status === "done") {
          updateStepStatus(3, "completed")
          setCurrentStep(4)
          setTimeout(() => {
            clearInterval(pollInterval)
            onComplete()
          }, 1000)
        }

        if (meeting.status === "failed") {
          clearInterval(pollInterval)
          // Handle error state
        }
      } catch (error) {
      }
    }, 2000)

    return () => clearInterval(pollInterval)
  }, [meetingId, partialResults, onComplete])

  const updateStepStatus = (
    index: number,
    status: "pending" | "processing" | "completed"
  ) => {
    setProcessingSteps((prev) =>
      prev.map((step, i) => (i === index ? { ...step, status } : step))
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="w-20 h-20 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Sparkles className="w-10 h-10 text-purple-400" />
          </motion.div>
        </div>
        <h2 className="text-3xl font-bold mb-2">Analyzing Your Meeting</h2>
        <p className="text-muted-foreground">
          Our AI is processing your recording. This usually takes 1-2 minutes.
        </p>
      </motion.div>

      {/* Processing Steps */}
      <div className="glass-card p-8">
        <div className="space-y-6">
          {processingSteps.map((step, index) => {
            const Icon = step.icon
            const isActive = step.status === "processing"
            const isCompleted = step.status === "completed"

            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-4"
              >
                {/* Icon */}
                <div
                  className={`
                  w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 transition-all
                  ${isCompleted
                      ? "bg-green-500/20 border-2 border-green-500/50"
                      : isActive
                        ? "bg-purple-500/20 border-2 border-purple-500/50"
                        : "bg-white/5 border-2 border-white/10"
                    }
                `}
                >
                  <AnimatePresence mode="wait">
                    {isCompleted ? (
                      <motion.div
                        key="check"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                      >
                        <CheckCircle2 className="w-6 h-6 text-green-400" />
                      </motion.div>
                    ) : isActive ? (
                      <motion.div
                        key="spinner"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <Loader2 className="w-6 h-6 text-purple-400" />
                      </motion.div>
                    ) : (
                      <Icon className="w-6 h-6 text-muted-foreground" />
                    )}
                  </AnimatePresence>
                </div>

                {/* Label */}
                <div className="flex-1">
                  <p
                    className={`font-medium ${isActive || isCompleted
                        ? "text-foreground"
                        : "text-muted-foreground"
                      }`}
                  >
                    {step.label}
                  </p>
                  {isActive && (
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="h-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full mt-2"
                    />
                  )}
                </div>

                {/* Status */}
                <div className="text-sm font-medium">
                  {isCompleted && (
                    <span className="text-green-400">Complete</span>
                  )}
                  {isActive && (
                    <span className="text-purple-400">Processing...</span>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Partial Results Preview */}
      <AnimatePresence>
        {(partialResults.transcript || partialResults.summary || partialResults.tasksCount) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="space-y-4"
          >
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              Preview Results
            </h3>

            {/* Transcript Preview */}
            {partialResults.transcript && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card p-6"
              >
                <div className="flex items-center gap-2 mb-3">
                  <FileAudio className="w-5 h-5 text-blue-400" />
                  <h4 className="font-semibold">Transcript</h4>
                  <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-400">
                    Ready
                  </span>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {partialResults.transcript}
                </p>
              </motion.div>
            )}

            {/* Summary Preview */}
            {partialResults.summary && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card p-6"
              >
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="w-5 h-5 text-purple-400" />
                  <h4 className="font-semibold">Summary</h4>
                  <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-400">
                    Ready
                  </span>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {partialResults.summary}
                </p>
              </motion.div>
            )}

            {/* Tasks Preview */}
            {partialResults.tasksCount && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card p-6"
              >
                <div className="flex items-center gap-2 mb-3">
                  <ListTodo className="w-5 h-5 text-green-400" />
                  <h4 className="font-semibold">Action Items</h4>
                  <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-400">
                    {partialResults.tasksCount} found
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  We've identified {partialResults.tasksCount} action items from your meeting
                </p>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress Indicator */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass">
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-2 h-2 bg-purple-400 rounded-full"
          />
          <span className="text-sm text-muted-foreground">
            Step {currentStep + 1} of {processingSteps.length}
          </span>
        </div>
      </div>
    </div>
  )
}
