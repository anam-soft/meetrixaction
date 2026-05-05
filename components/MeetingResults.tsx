"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  FileText,
  ListTodo,
  FileAudio,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Search,
  BarChart3,
  Share2,
  Mail,
  Calendar,
  User,
  Clock,
  AlertCircle,
  Sparkles,
  ExternalLink,
} from "lucide-react"

interface Task {
  id: string
  title: string
  description: string | null
  assignee: string | null
  deadline: string | null
  status: string
  confidence: "high" | "medium" | "low"
  evidence?: string
  transcriptTimestamp?: number
}

interface Meeting {
  id: string
  title: string
  summary: string | null
  transcript: string | null
  decisions: string | null
  duration: number | null
  created_at: string
  tasks: Task[]
}

interface MeetingResultsProps {
  meeting: Meeting
  onTaskUpdate: (taskId: string, updates: Partial<Task>) => void
  onShare: () => void
}

export default function MeetingResults({
  meeting,
  onTaskUpdate,
  onShare,
}: MeetingResultsProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "transcript">("overview")
  const [expandedSections, setExpandedSections] = useState({
    summary: true,
    decisions: true,
    tasks: true,
    insights: false,
  })
  const [copiedText, setCopiedText] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [highlightedText, setHighlightedText] = useState<string | null>(null)

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }))
  }

  const handleCopy = async (text: string, label: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedText(label)
    setTimeout(() => setCopiedText(null), 2000)
  }

  const getConfidenceBadge = (confidence: Task["confidence"]) => {
    const styles = {
      high: "bg-green-500/20 text-green-400 border-green-500/30",
      medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      low: "bg-red-500/20 text-red-400 border-red-500/30",
    }
    return (
      <span
        className={`text-xs px-2 py-1 rounded-full border ${styles[confidence]}`}
      >
        {confidence} confidence
      </span>
    )
  }

  const highlightTranscript = (evidence: string) => {
    setHighlightedText(evidence)
    setActiveTab("transcript")
    // Scroll to highlighted text
    setTimeout(() => {
      const element = document.getElementById("transcript-content")
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" })
      }
    }, 100)
  }

  const completedTasks = meeting.tasks.filter((t) => t.status === "completed").length
  const totalTasks = meeting.tasks.length
  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">{meeting.title}</h1>
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {new Date(meeting.created_at).toLocaleDateString()}
            </span>
            {meeting.duration && (
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {Math.round(meeting.duration / 60)} min
              </span>
            )}
            <span className="flex items-center gap-2">
              <ListTodo className="w-4 h-4" />
              {totalTasks} tasks
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={onShare}
            className="px-4 py-2 glass rounded-lg font-semibold hover:bg-white/10 transition-colors flex items-center gap-2"
          >
            <Share2 className="w-4 h-4" />
            Share
          </button>
          <button
            onClick={() => handleCopy(meeting.summary || "", "summary")}
            className="px-4 py-2 glass rounded-lg font-semibold hover:bg-white/10 transition-colors flex items-center gap-2"
          >
            {copiedText === "summary" ? (
              <>
                <Check className="w-4 h-4 text-green-400" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copy All
              </>
            )}
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="glass-card p-2 inline-flex rounded-lg">
        <button
          onClick={() => setActiveTab("overview")}
          className={`px-6 py-2 rounded-lg font-semibold transition-all ${
            activeTab === "overview"
              ? "bg-gradient-to-r from-purple-600 to-pink-600"
              : "hover:bg-white/5"
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab("transcript")}
          className={`px-6 py-2 rounded-lg font-semibold transition-all ${
            activeTab === "transcript"
              ? "bg-gradient-to-r from-purple-600 to-pink-600"
              : "hover:bg-white/5"
          }`}
        >
          Transcript
        </button>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <AnimatePresence mode="wait">
            {activeTab === "overview" ? (
              <motion.div
                key="overview"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                {/* Summary Section */}
                {meeting.summary && (
                  <div className="glass-card overflow-hidden">
                    <button
                      onClick={() => toggleSection("summary")}
                      className="w-full p-6 flex items-center justify-between hover:bg-white/5 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-500/20">
                          <FileText className="w-5 h-5 text-blue-400" />
                        </div>
                        <h2 className="text-xl font-bold">Smart Summary</h2>
                      </div>
                      {expandedSections.summary ? (
                        <ChevronUp className="w-5 h-5" />
                      ) : (
                        <ChevronDown className="w-5 h-5" />
                      )}
                    </button>

                    <AnimatePresence>
                      {expandedSections.summary && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="px-6 pb-6 space-y-4">
                            <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                              {meeting.summary}
                            </p>
                            <button
                              onClick={() =>
                                handleCopy(meeting.summary || "", "summary")
                              }
                              className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-2"
                            >
                              <Copy className="w-4 h-4" />
                              Copy summary
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {/* Key Decisions */}
                {meeting.decisions && (
                  <div className="glass-card overflow-hidden">
                    <button
                      onClick={() => toggleSection("decisions")}
                      className="w-full p-6 flex items-center justify-between hover:bg-white/5 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-purple-500/20">
                          <Sparkles className="w-5 h-5 text-purple-400" />
                        </div>
                        <h2 className="text-xl font-bold">Key Decisions</h2>
                      </div>
                      {expandedSections.decisions ? (
                        <ChevronUp className="w-5 h-5" />
                      ) : (
                        <ChevronDown className="w-5 h-5" />
                      )}
                    </button>

                    <AnimatePresence>
                      {expandedSections.decisions && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="px-6 pb-6">
                            <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                              {meeting.decisions}
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {/* Action Items */}
                <div className="glass-card overflow-hidden">
                  <button
                    onClick={() => toggleSection("tasks")}
                    className="w-full p-6 flex items-center justify-between hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-green-500/20">
                        <ListTodo className="w-5 h-5 text-green-400" />
                      </div>
                      <div className="text-left">
                        <h2 className="text-xl font-bold">
                          Action Items ({totalTasks})
                        </h2>
                        <p className="text-sm text-muted-foreground">
                          {completedTasks} completed
                        </p>
                      </div>
                    </div>
                    {expandedSections.tasks ? (
                      <ChevronUp className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </button>

                  <AnimatePresence>
                    {expandedSections.tasks && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-6 space-y-3">
                          {meeting.tasks.length === 0 ? (
                            <div className="text-center py-8">
                              <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                              <p className="text-muted-foreground">
                                No action items detected
                              </p>
                              <button className="mt-4 text-sm text-purple-400 hover:text-purple-300">
                                Add manually
                              </button>
                            </div>
                          ) : (
                            meeting.tasks.map((task, index) => (
                              <motion.div
                                key={task.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="p-4 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 transition-all group"
                              >
                                <div className="flex items-start gap-3">
                                  <input
                                    type="checkbox"
                                    checked={task.status === "completed"}
                                    onChange={(e) =>
                                      onTaskUpdate(task.id, {
                                        status: e.target.checked
                                          ? "completed"
                                          : "pending",
                                      })
                                    }
                                    className="mt-1 w-5 h-5 rounded border-2 border-white/20 bg-white/5 checked:bg-gradient-to-r checked:from-purple-600 checked:to-pink-600 cursor-pointer"
                                  />
                                  <div className="flex-1 space-y-2">
                                    <p
                                      className={`font-medium ${
                                        task.status === "completed"
                                          ? "line-through text-muted-foreground"
                                          : ""
                                      }`}
                                    >
                                      {task.title}
                                    </p>

                                    {task.description && (
                                      <p className="text-sm text-muted-foreground">
                                        {task.description}
                                      </p>
                                    )}

                                    <div className="flex flex-wrap items-center gap-2">
                                      {getConfidenceBadge(task.confidence)}

                                      {task.assignee && (
                                        <span className="text-xs px-2 py-1 rounded-full bg-blue-500/20 text-blue-400 flex items-center gap-1">
                                          <User className="w-3 h-3" />
                                          {task.assignee}
                                        </span>
                                      )}

                                      {task.deadline && (
                                        <span className="text-xs px-2 py-1 rounded-full bg-orange-500/20 text-orange-400 flex items-center gap-1">
                                          <Calendar className="w-3 h-3" />
                                          {new Date(task.deadline).toLocaleDateString()}
                                        </span>
                                      )}
                                    </div>

                                    {/* Evidence Link */}
                                    {task.evidence && (
                                      <button
                                        onClick={() =>
                                          highlightTranscript(task.evidence!)
                                        }
                                        className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 group-hover:underline"
                                      >
                                        <ExternalLink className="w-3 h-3" />
                                        Based on: "{task.evidence.substring(0, 50)}..."
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </motion.div>
                            ))
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="transcript"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="glass-card p-6"
              >
                {/* Search */}
                <div className="mb-6">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search transcript..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500/50"
                    />
                  </div>
                </div>

                {/* Transcript Content */}
                <div
                  id="transcript-content"
                  className="prose prose-invert max-w-none"
                >
                  {meeting.transcript ? (
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                      {highlightedText
                        ? meeting.transcript
                            .split(highlightedText)
                            .map((part, i, arr) =>
                              i < arr.length - 1 ? (
                                <span key={i}>
                                  {part}
                                  <mark className="bg-yellow-500/30 text-yellow-200 px-1 rounded">
                                    {highlightedText}
                                  </mark>
                                </span>
                              ) : (
                                part
                              )
                            )
                        : meeting.transcript}
                    </p>
                  ) : (
                    <div className="text-center py-12">
                      <FileAudio className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                      <p className="text-muted-foreground">
                        Transcript not available
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sidebar - Insights */}
        <div className="space-y-6">
          {/* Meeting Insights */}
          <div className="glass-card p-6">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-purple-400" />
              Meeting Insights
            </h3>

            <div className="space-y-4">
              {/* Completion Rate */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">
                    Task Completion
                  </span>
                  <span className="text-sm font-semibold">
                    {completionRate.toFixed(0)}%
                  </span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-green-600 to-emerald-600"
                    initial={{ width: 0 }}
                    animate={{ width: `${completionRate}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                  />
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-white/5">
                  <div className="text-2xl font-bold gradient-text">
                    {totalTasks}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Total Tasks
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-white/5">
                  <div className="text-2xl font-bold gradient-text">
                    {meeting.duration ? Math.round(meeting.duration / 60) : 0}
                  </div>
                  <div className="text-xs text-muted-foreground">Minutes</div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="glass-card p-6">
            <h3 className="font-bold mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <button className="w-full px-4 py-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors flex items-center gap-3 text-left">
                <Mail className="w-5 h-5 text-blue-400" />
                <span className="text-sm font-medium">Send to Team</span>
              </button>
              <button className="w-full px-4 py-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors flex items-center gap-3 text-left">
                <Calendar className="w-5 h-5 text-green-400" />
                <span className="text-sm font-medium">Schedule Follow-up</span>
              </button>
              <button className="w-full px-4 py-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors flex items-center gap-3 text-left">
                <Copy className="w-5 h-5 text-purple-400" />
                <span className="text-sm font-medium">Export Report</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
