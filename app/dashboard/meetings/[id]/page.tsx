"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import DashboardLayout from "@/components/DashboardLayout"
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  AlertCircle,
  Share2,
  Calendar,
  Users as UsersIcon,
  FileText,
  Copy,
  Check,
} from "lucide-react"

interface Task {
  id: string
  title: string
  description: string | null
  status: string
  priority: string
  deadline: string | null
  assignee_id: string | null
  confidence: number
  users: { name: string; avatar: string | null } | null
}

interface Meeting {
  id: string
  title: string
  summary: string | null
  decisions: string | null
  transcript: string | null
  duration: number | null
  created_at: string
  status: string
  tasks: Task[]
}

export default function MeetingDetailPage() {
  const params = useParams()
  const router = useRouter()
  const meetingId = params.id as string

  const [meeting, setMeeting] = useState<Meeting | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"summary" | "tasks" | "transcript">("summary")
  const [shareLink, setShareLink] = useState("")
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (meetingId) {
      fetchMeeting()
    }
  }, [meetingId])

  const fetchMeeting = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/meetings?id=${meetingId}`)
      const data = await res.json()
      if (data.meeting) {
        setMeeting(data.meeting)
      } else {
        router.push("/dashboard/meetings")
      }
    } catch (error) {
      console.error("Failed to fetch meeting:", error)
      router.push("/dashboard/meetings")
    } finally {
      setLoading(false)
    }
  }

  const toggleTaskStatus = async (taskId: string, currentStatus: string) => {
    const newStatus = currentStatus === "completed" ? "pending" : "completed"

    await fetch("/api/tasks", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ taskId, status: newStatus }),
    })

    fetchMeeting()
  }

  const generateShareLink = () => {
    const link = `${window.location.origin}/share/meeting/${meetingId}`
    setShareLink(link)
  }

  const copyShareLink = () => {
    navigator.clipboard.writeText(shareLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading meeting...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!meeting) {
    return null
  }

  const completedTasks = meeting.tasks.filter(t => t.status === "completed").length
  const totalTasks = meeting.tasks.length
  const overdueTasks = meeting.tasks.filter(
    t => t.status === "pending" && t.deadline && new Date(t.deadline) < new Date()
  ).length
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  // Parse decisions if it's a JSON string
  let decisionsArray: string[] = []
  if (meeting.decisions) {
    try {
      decisionsArray = JSON.parse(meeting.decisions)
    } catch {
      decisionsArray = [meeting.decisions]
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <Link
            href="/dashboard/meetings"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to meetings
          </Link>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold gradient-text mb-2">
                {meeting.title}
              </h1>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {new Date(meeting.created_at).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </div>
                {meeting.duration && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {Math.round(meeting.duration / 60)} min
                  </div>
                )}
                <span
                  className={`px-2 py-1 rounded-full text-xs ${
                    meeting.status === "done"
                      ? "bg-green-500/20 text-green-400"
                      : meeting.status === "processing"
                      ? "bg-yellow-500/20 text-yellow-400"
                      : "bg-blue-500/20 text-blue-400"
                  }`}
                >
                  {meeting.status}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Content (60%) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tab Navigation */}
            <div className="glass-card p-2">
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTab("summary")}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === "summary"
                      ? "bg-gradient-to-r from-purple-600/20 to-pink-600/20 text-foreground border border-purple-500/30"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                  }`}
                >
                  Summary
                </button>
                <button
                  onClick={() => setActiveTab("tasks")}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === "tasks"
                      ? "bg-gradient-to-r from-purple-600/20 to-pink-600/20 text-foreground border border-purple-500/30"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                  }`}
                >
                  Tasks ({totalTasks})
                </button>
                {meeting.transcript && (
                  <button
                    onClick={() => setActiveTab("transcript")}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                      activeTab === "transcript"
                        ? "bg-gradient-to-r from-purple-600/20 to-pink-600/20 text-foreground border border-purple-500/30"
                        : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                    }`}
                  >
                    Transcript
                  </button>
                )}
              </div>
            </div>

            {/* Tab Content */}
            <div className="glass-card p-6">
              {/* Summary Tab */}
              {activeTab === "summary" && (
                <div className="space-y-6">
                  {meeting.summary ? (
                    <>
                      <div>
                        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                          <FileText className="w-5 h-5 text-purple-400" />
                          AI-Generated Summary
                        </h3>
                        <p className="text-muted-foreground leading-relaxed">
                          {meeting.summary}
                        </p>
                      </div>

                      {decisionsArray.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5 text-green-400" />
                            Key Decisions
                          </h3>
                          <ul className="space-y-2">
                            {decisionsArray.map((decision, index) => (
                              <li key={index} className="flex items-start gap-3">
                                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-2 flex-shrink-0" />
                                <span className="text-muted-foreground">{decision}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div className="pt-4 border-t border-white/10">
                        <h3 className="text-sm font-semibold mb-2 text-muted-foreground">
                          Meeting Metadata
                        </h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Date</p>
                            <p className="font-medium">
                              {new Date(meeting.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          {meeting.duration && (
                            <div>
                              <p className="text-muted-foreground">Duration</p>
                              <p className="font-medium">
                                {Math.round(meeting.duration / 60)} minutes
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                      <p className="text-muted-foreground">
                        {meeting.status === "processing"
                          ? "Summary is being generated..."
                          : "No summary available"}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Tasks Tab */}
              {activeTab === "tasks" && (
                <div className="space-y-4">
                  {meeting.tasks.length === 0 ? (
                    <div className="text-center py-8">
                      <CheckCircle2 className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                      <p className="text-muted-foreground">
                        {meeting.status === "processing"
                          ? "Tasks are being extracted..."
                          : "No tasks found in this meeting"}
                      </p>
                    </div>
                  ) : (
                    <>
                      {meeting.tasks.map((task) => (
                        <div
                          key={task.id}
                          className="p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors border border-white/10"
                        >
                          <div className="flex items-start gap-3">
                            <button
                              onClick={() => toggleTaskStatus(task.id, task.status)}
                              className="mt-1 flex-shrink-0"
                            >
                              {task.status === "completed" ? (
                                <CheckCircle2 className="w-5 h-5 text-green-400" />
                              ) : (
                                <div className="w-5 h-5 rounded-full border-2 border-muted-foreground hover:border-purple-400 transition-colors" />
                              )}
                            </button>
                            <div className="flex-1 min-w-0">
                              <h3
                                className={`font-semibold mb-1 ${
                                  task.status === "completed"
                                    ? "line-through text-muted-foreground"
                                    : ""
                                }`}
                              >
                                {task.title}
                              </h3>
                              {task.description && (
                                <p className="text-sm text-muted-foreground mb-2">
                                  {task.description}
                                </p>
                              )}
                              <div className="flex flex-wrap items-center gap-2">
                                {task.users && (
                                  <span className="text-xs px-2 py-1 rounded-full bg-blue-500/20 text-blue-400 flex items-center gap-1">
                                    <UsersIcon className="w-3 h-3" />
                                    {task.users.name}
                                  </span>
                                )}
                                {task.deadline && (
                                  <span
                                    className={`text-xs px-2 py-1 rounded-full ${
                                      new Date(task.deadline) < new Date() &&
                                      task.status !== "completed"
                                        ? "bg-red-500/20 text-red-400"
                                        : "bg-yellow-500/20 text-yellow-400"
                                    }`}
                                  >
                                    Due: {new Date(task.deadline).toLocaleDateString()}
                                  </span>
                                )}
                                <span
                                  className={`text-xs px-2 py-1 rounded-full ${
                                    task.priority === "high"
                                      ? "bg-red-500/20 text-red-400"
                                      : task.priority === "medium"
                                      ? "bg-yellow-500/20 text-yellow-400"
                                      : "bg-green-500/20 text-green-400"
                                  }`}
                                >
                                  {task.priority}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              )}

              {/* Transcript Tab */}
              {activeTab === "transcript" && (
                <div>
                  {meeting.transcript ? (
                    <div className="prose prose-invert max-w-none">
                      <pre className="whitespace-pre-wrap text-sm text-muted-foreground leading-relaxed">
                        {meeting.transcript}
                      </pre>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                      <p className="text-muted-foreground">
                        No transcript available for this meeting
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Stats & Actions (40%) */}
          <div className="space-y-6">
            {/* Meeting Stats */}
            <div className="glass-card p-6">
              <h3 className="font-semibold mb-4">Meeting Stats</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Total tasks</span>
                    <span className="font-semibold">{totalTasks}</span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Completed</span>
                    <span className="font-semibold text-green-400">{completedTasks}</span>
                  </div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-muted-foreground">Overdue</span>
                    <span className="font-semibold text-red-400">{overdueTasks}</span>
                  </div>

                  {/* Completion Ring */}
                  <div className="relative w-32 h-32 mx-auto">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        className="text-white/10"
                      />
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="url(#gradient)"
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 56}`}
                        strokeDashoffset={`${2 * Math.PI * 56 * (1 - completionRate / 100)}`}
                        className="transition-all duration-500"
                        strokeLinecap="round"
                      />
                      <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#a855f7" />
                          <stop offset="100%" stopColor="#ec4899" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <p className="text-2xl font-bold">{completionRate}%</p>
                        <p className="text-xs text-muted-foreground">Complete</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Share Button */}
            <div className="glass-card p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Share2 className="w-5 h-5 text-purple-400" />
                Share Meeting
              </h3>
              {!shareLink ? (
                <button
                  onClick={generateShareLink}
                  className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-semibold hover:shadow-lg transition-shadow"
                >
                  Generate Share Link
                </button>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs text-muted-foreground">
                    Anyone with this link can view the summary and tasks (read-only)
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={shareLink}
                      readOnly
                      className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm"
                    />
                    <button
                      onClick={copyShareLink}
                      className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                      title="Copy link"
                    >
                      {copied ? (
                        <Check className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
