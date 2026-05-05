"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import DashboardLayout from "@/components/DashboardLayout"
import {
  FileAudio,
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
  Upload,
  ArrowRight,
  Zap,
} from "lucide-react"

interface Meeting {
  id: string
  title: string
  status: string
  created_at: string
  tasks: { id: string; status: string }[]
}

interface Task {
  id: string
  title: string
  status: string
  deadline: string | null
  confidence: number
  meetings: { title: string }
}

interface Usage {
  canUpload: boolean
  currentUsage: number
  limit: number
  isPro: boolean
}

export default function DashboardPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [usage, setUsage] = useState<Usage | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      await Promise.all([fetchMeetings(), fetchTasks(), fetchUsage()])
    } finally {
      setLoading(false)
    }
  }

  const fetchMeetings = async () => {
    const res = await fetch("/api/meetings")
    const data = await res.json()
    setMeetings(data.meetings || [])
  }

  const fetchTasks = async () => {
    const res = await fetch("/api/tasks")
    const data = await res.json()
    setTasks(data.tasks || [])
  }

  const fetchUsage = async () => {
    const res = await fetch("/api/usage")
    const data = await res.json()
    setUsage(data)
  }

  const handleUpgrade = async () => {
    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        priceId:
          process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID ||
          "price_1TSveBRuoH55oHIo89qWZ8js",
      }),
    })
    const data = await res.json()
    if (data.url) {
      window.location.href = data.url
    }
  }

  const toggleTaskStatus = async (taskId: string, currentStatus: string) => {
    const newStatus = currentStatus === "completed" ? "pending" : "completed"

    await fetch("/api/tasks", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ taskId, status: newStatus }),
    })

    fetchTasks()
  }

  const completedTasks = tasks.filter((t) => t.status === "completed").length
  const pendingTasks = tasks.filter((t) => t.status === "pending").length
  const overdueTasks = tasks.filter(
    (t) =>
      t.status === "pending" && t.deadline && new Date(t.deadline) < new Date()
  ).length

  const completionRate =
    tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold gradient-text mb-2">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's your productivity overview.
          </p>
        </div>

        {/* Upgrade Banner */}
        {usage && !usage.isPro && (
          <div className="glass-card p-6 bg-gradient-to-r from-purple-600/10 to-pink-600/10 border-purple-500/30">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-purple-500/20">
                  <Zap className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">
                    Upgrade to Pro for Unlimited Access
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {usage.currentUsage} / {usage.limit} meetings used this
                    month. Get unlimited meetings, priority support, and
                    advanced analytics.
                  </p>
                </div>
              </div>
              <button
                onClick={handleUpgrade}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-semibold hover:shadow-lg transition-shadow whitespace-nowrap flex items-center gap-2"
              >
                Upgrade Now
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-card p-6 hover:border-blue-500/30 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-blue-500/20">
                <FileAudio className="w-6 h-6 text-blue-400" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <p className="text-3xl font-bold mb-1">{meetings.length}</p>
            <p className="text-sm text-muted-foreground">Total Meetings</p>
          </div>

          <div className="glass-card p-6 hover:border-green-500/30 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-green-500/20">
                <CheckCircle2 className="w-6 h-6 text-green-400" />
              </div>
              <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-400">
                {completionRate}%
              </span>
            </div>
            <p className="text-3xl font-bold mb-1">{completedTasks}</p>
            <p className="text-sm text-muted-foreground">Tasks Completed</p>
          </div>

          <div className="glass-card p-6 hover:border-yellow-500/30 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-yellow-500/20">
                <Clock className="w-6 h-6 text-yellow-400" />
              </div>
            </div>
            <p className="text-3xl font-bold mb-1">{pendingTasks}</p>
            <p className="text-sm text-muted-foreground">Pending Tasks</p>
          </div>

          <div className="glass-card p-6 hover:border-red-500/30 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-red-500/20">
                <AlertCircle className="w-6 h-6 text-red-400" />
              </div>
              {overdueTasks > 0 && (
                <span className="text-xs px-2 py-1 rounded-full bg-red-500/20 text-red-400 animate-pulse">
                  Urgent
                </span>
              )}
            </div>
            <p className="text-3xl font-bold mb-1">{overdueTasks}</p>
            <p className="text-sm text-muted-foreground">Overdue Tasks</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="glass-card p-6">
          <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/dashboard/meetings"
              className="p-4 rounded-lg bg-gradient-to-br from-purple-600/10 to-blue-600/10 border border-purple-500/30 hover:border-purple-500/50 transition-colors group"
            >
              <Upload className="w-8 h-8 text-purple-400 mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold mb-1">Upload Meeting</h3>
              <p className="text-sm text-muted-foreground">
                Process a new recording
              </p>
            </Link>

            <Link
              href="/dashboard/tasks"
              className="p-4 rounded-lg bg-gradient-to-br from-green-600/10 to-emerald-600/10 border border-green-500/30 hover:border-green-500/50 transition-colors group"
            >
              <CheckCircle2 className="w-8 h-8 text-green-400 mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold mb-1">Manage Tasks</h3>
              <p className="text-sm text-muted-foreground">
                Track and complete tasks
              </p>
            </Link>

            <Link
              href="/dashboard/analytics"
              className="p-4 rounded-lg bg-gradient-to-br from-pink-600/10 to-orange-600/10 border border-pink-500/30 hover:border-pink-500/50 transition-colors group"
            >
              <TrendingUp className="w-8 h-8 text-pink-400 mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold mb-1">View Analytics</h3>
              <p className="text-sm text-muted-foreground">
                Track your productivity
              </p>
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Meetings */}
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Recent Meetings</h2>
              <Link
                href="/dashboard/meetings"
                className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1"
              >
                View all
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            {meetings.length === 0 ? (
              <div className="text-center py-8">
                <FileAudio className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                <p className="text-muted-foreground mb-4">
                  No meetings yet. Upload your first meeting to get started!
                </p>
                <Link
                  href="/dashboard/meetings"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-semibold hover:shadow-lg transition-shadow"
                >
                  <Upload className="w-4 h-4" />
                  Upload Meeting
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {meetings.slice(0, 5).map((meeting) => (
                  <Link
                    key={meeting.id}
                    href={`/dashboard/meetings`}
                    className="block p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors border border-transparent hover:border-purple-500/30"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold mb-1">{meeting.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {meeting.tasks.length} tasks •{" "}
                          {new Date(meeting.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <span
                        className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ml-2 ${
                          meeting.status === "done"
                            ? "bg-green-500/20 text-green-400"
                            : meeting.status === "processing"
                            ? "bg-yellow-500/20 text-yellow-400"
                            : meeting.status === "failed"
                            ? "bg-red-500/20 text-red-400"
                            : "bg-blue-500/20 text-blue-400"
                        }`}
                      >
                        {meeting.status}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Recent Tasks */}
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Recent Tasks</h2>
              <Link
                href="/dashboard/tasks"
                className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1"
              >
                View all
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            {tasks.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle2 className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                <p className="text-muted-foreground">
                  No tasks yet. Upload a meeting to generate action items!
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {tasks.slice(0, 5).map((task) => (
                  <div
                    key={task.id}
                    className="p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
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
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{task.meetings.title}</span>
                          {task.deadline && (
                            <>
                              <span>•</span>
                              <span
                                className={
                                  new Date(task.deadline) < new Date() &&
                                  task.status !== "completed"
                                    ? "text-red-400"
                                    : ""
                                }
                              >
                                Due:{" "}
                                {new Date(task.deadline).toLocaleDateString()}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
