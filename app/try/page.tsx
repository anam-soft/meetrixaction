"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowRight, Sparkles, CheckCircle2, Loader2 } from "lucide-react"
import { SignUpButton } from "@clerk/nextjs"
import { SAMPLE_TRANSCRIPTS, SampleType } from "@/lib/sample-transcripts"

type Step = "input" | "processing" | "results"

interface ExtractedData {
  title: string
  summary: string
  tasks: Array<{
    name: string
    assignee: string
    due_text: string
    priority: "high" | "medium" | "low"
  }>
  decisions: string[]
  participants: string[]
}

const PROCESSING_STEPS = [
  "Reading transcript",
  "Identifying speakers and topics",
  "Extracting action items with owners",
  "Detecting deadlines and priorities",
]

export default function TryPage() {
  const [step, setStep] = useState<Step>("input")
  const [transcript, setTranscript] = useState("")
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null)
  const [processingStep, setProcessingStep] = useState(0)
  const [error, setError] = useState("")

  const handleSampleClick = (type: SampleType) => {
    setTranscript(SAMPLE_TRANSCRIPTS[type])
    setError("")
  }

  const handleExtract = async () => {
    if (!transcript.trim()) {
      setError("Please paste a transcript or select a sample")
      return
    }

    setError("")
    setStep("processing")
    setProcessingStep(0)

    // Animate through processing steps
    const stepInterval = setInterval(() => {
      setProcessingStep((prev) => {
        if (prev >= PROCESSING_STEPS.length - 1) {
          clearInterval(stepInterval)
          return prev
        }
        return prev + 1
      })
    }, 750)

    try {
      const response = await fetch("/api/demo/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to extract tasks")
      }

      // Wait for animation to complete
      await new Promise((resolve) => setTimeout(resolve, 3000))
      clearInterval(stepInterval)

      setExtractedData(data)
      setStep("results")
    } catch (err: any) {
      clearInterval(stepInterval)
      setError(err.message || "Something went wrong. Please try again.")
      setStep("input")
    }
  }

  const handleReset = () => {
    setStep("input")
    setTranscript("")
    setExtractedData(null)
    setProcessingStep(0)
    setError("")
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500"
      case "medium":
        return "bg-amber-500"
      case "low":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900/20 via-background to-pink-900/20">
      {/* Header */}
      <header className="border-b border-white/10 bg-background/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <a href="/" className="text-2xl font-bold gradient-text">
            MeetRix Action
          </a>
          <div className="flex items-center gap-4">
            <a href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Back to Home
            </a>
            <SignUpButton mode="modal">
              <button className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-semibold text-sm hover:shadow-lg hover:shadow-purple-500/50 transition-shadow">
                Sign Up Free
              </button>
            </SignUpButton>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <AnimatePresence mode="wait">
            {/* Step 1: Input */}
            {step === "input" && (
              <motion.div
                key="input"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="text-center space-y-4">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <span className="text-sm font-medium">Try it free — no account needed</span>
                  </div>
                  <h1 className="text-4xl md:text-5xl font-bold">
                    Paste a meeting transcript,
                    <br />
                    <span className="gradient-text">get instant action items</span>
                  </h1>
                  <p className="text-lg text-muted-foreground">
                    See exactly what MeetRix extracts — before you sign up for anything.
                  </p>
                </div>

                <div className="glass-card p-6 space-y-4">
                  <textarea
                    value={transcript}
                    onChange={(e) => setTranscript(e.target.value)}
                    placeholder="Paste your meeting notes or transcript here..."
                    className="w-full min-h-[200px] bg-background/50 border border-white/10 rounded-lg p-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  />

                  {error && (
                    <div className="text-red-400 text-sm flex items-center gap-2">
                      <div className="w-1 h-1 bg-red-400 rounded-full" />
                      {error}
                    </div>
                  )}

                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">Or try a sample:</p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => handleSampleClick("standup")}
                        className="px-4 py-2 glass rounded-full text-sm hover:bg-white/10 transition-colors"
                      >
                        Daily standup
                      </button>
                      <button
                        onClick={() => handleSampleClick("design")}
                        className="px-4 py-2 glass rounded-full text-sm hover:bg-white/10 transition-colors"
                      >
                        Design review
                      </button>
                      <button
                        onClick={() => handleSampleClick("planning")}
                        className="px-4 py-2 glass rounded-full text-sm hover:bg-white/10 transition-colors"
                      >
                        Sprint planning
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={handleExtract}
                    disabled={!transcript.trim()}
                    className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-purple-500/50 transition-shadow flex items-center justify-center gap-2"
                  >
                    Extract action items
                    <ArrowRight className="w-5 h-5" />
                  </button>

                  <p className="text-xs text-center text-muted-foreground">
                    Your data is not stored. Results disappear when you close this tab.
                  </p>
                </div>
              </motion.div>
            )}

            {/* Step 2: Processing */}
            {step === "processing" && (
              <motion.div
                key="processing"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-card p-12 text-center space-y-8"
              >
                <div className="flex justify-center">
                  <Loader2 className="w-16 h-16 text-purple-400 animate-spin" />
                </div>

                <div className="space-y-4">
                  <h2 className="text-2xl font-bold">Processing your meeting...</h2>
                  
                  <div className="space-y-3 max-w-md mx-auto">
                    {PROCESSING_STEPS.map((stepText, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ 
                          opacity: index <= processingStep ? 1 : 0.3,
                          x: 0 
                        }}
                        className="flex items-center gap-3 text-left"
                      >
                        {index <= processingStep ? (
                          <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                        ) : (
                          <div className="w-5 h-5 border-2 border-white/20 rounded-full flex-shrink-0" />
                        )}
                        <span className={index <= processingStep ? "text-foreground" : "text-muted-foreground"}>
                          {stepText}
                        </span>
                      </motion.div>
                    ))}
                  </div>

                  {/* Progress bar */}
                  <div className="w-full max-w-md mx-auto h-2 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-purple-600 to-pink-600"
                      initial={{ width: "0%" }}
                      animate={{ width: `${((processingStep + 1) / PROCESSING_STEPS.length) * 100}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 3: Results */}
            {step === "results" && extractedData && (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* Results Card */}
                <div className="glass-card p-6 space-y-6">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-2xl font-bold mb-2">{extractedData.title}</h2>
                      <p className="text-sm text-muted-foreground">
                        {extractedData.tasks.length} action items · just now
                      </p>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">
                      <CheckCircle2 className="w-4 h-4" />
                      Complete
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="space-y-2">
                    <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                      Summary
                    </h3>
                    <p className="text-foreground leading-relaxed">{extractedData.summary}</p>
                  </div>

                  {/* Tasks */}
                  <div className="space-y-3">
                    <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                      Action Items ({extractedData.tasks.length})
                    </h3>
                    <div className="space-y-2">
                      {extractedData.tasks.map((task, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-start gap-3 p-3 bg-background/50 rounded-lg border border-white/5 hover:border-white/10 transition-colors"
                        >
                          <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${getPriorityColor(task.priority)}`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-foreground">{task.name}</p>
                            <div className="flex flex-wrap gap-2 mt-2">
                              <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs">
                                {task.assignee}
                              </span>
                              <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded text-xs">
                                {task.due_text}
                              </span>
                              <span className="px-2 py-1 bg-white/10 text-muted-foreground rounded text-xs capitalize">
                                {task.priority}
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Decisions */}
                  {extractedData.decisions.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                        Key Decisions
                      </h3>
                      <ul className="space-y-2">
                        {extractedData.decisions.map((decision, index) => (
                          <li key={index} className="flex items-start gap-2 text-foreground">
                            <div className="w-1.5 h-1.5 bg-purple-400 rounded-full mt-2 flex-shrink-0" />
                            <span>{decision}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Sign-up Nudge */}
                <div className="glass-card p-8 bg-gradient-to-br from-purple-900/20 to-pink-900/20 border-purple-500/30 space-y-6">
                  <div className="flex flex-wrap gap-3 justify-center">
                    <div className="px-4 py-2 bg-white/10 rounded-full text-sm">
                      ✨ {extractedData.tasks.length} tasks extracted
                    </div>
                    <div className="px-4 py-2 bg-white/10 rounded-full text-sm">
                      👥 {extractedData.participants.length} owners assigned
                    </div>
                    <div className="px-4 py-2 bg-white/10 rounded-full text-sm">
                      ✅ 0 items missed
                    </div>
                  </div>

                  <div className="text-center space-y-4">
                    <h3 className="text-2xl font-bold">Save this and start tracking</h3>
                    <p className="text-muted-foreground max-w-lg mx-auto">
                      Create a free account to keep these tasks, assign them to your team, and get reminders when deadlines approach.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                      <SignUpButton mode="modal">
                        <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-shadow flex items-center justify-center gap-2">
                          Start free — 5 meetings included
                          <ArrowRight className="w-5 h-5" />
                        </button>
                      </SignUpButton>
                      <button
                        onClick={handleReset}
                        className="px-6 py-3 glass rounded-lg font-semibold hover:bg-white/10 transition-colors"
                      >
                        Try another transcript
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  )
}
