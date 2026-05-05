"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import DashboardLayout from "@/components/DashboardLayout"
import UpgradeSuccessToast from "@/components/UpgradeSuccessToast"
import {
  FileAudio,
  CheckCircle2,
  Clock,
  AlertCircle,
  Upload,
  ArrowRight,
  Trash2,
  Eye,
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
  assignee_id: string | null
  meetings: { title: string; id: string }
}

interface Usage {
  canUpload: boolean
  currentUsage: number
  limit: number
  isPro: boolean
}

export default function DashboardPage() {
  const searchParams = useSearchParams()
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [usage, setUsage] = useState<Usage | null>(null)
  const [loading, setLoading] = useState(true)
  const [showSuccessToast, setShowSuccessToast] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)

  useEffect(() => {
    fetchData()
    
    // Check for upgrade success
    const success = searchParams.get('success')
    const upgradeSuccess = searchParams.get('upgrade')
    
    if (success === 'true' || upgradeSuccess === 'success') {
      setShowSuccessToast(true)
      
      // Sync subscription from Stripe after successful payment
      syncSubscription()
      
      // Clean up URL
      window.history.replaceState({}, '', '/dashboard')
    }
  }, [searchParams])

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

  const syncSubscription = async () => {
    try {
      await fetch("/api/subscription/sync", { method: "POST" })
      await fetchUsage()
    } catch (error) {
      console.error("Failed to sync subscription:", error)
    }
  }

  const deleteMeeting = async (meetingId: string) => {
    if (!confirm("Are you sure you want to delete this meeting?")) return
    
    await fetch(`/api/meetings?id=${meetingId}`, { method: "DELETE" })
    fetchMeetings()
    fetchTasks()
  }

  // Calculate metrics
  const thisMonth = new Date().toISOString().slice(0, 7)
  const meetingsThisMonth = meetings.filter(m => 
    m.created_at.startsWith(thisMonth)
  ).length
  
  const tasksExtracted = tasks.length
  const tasksCompleted = tasks.filter(t => t.status === "completed").length
  const completionRate = tasksExtracted > 0 
    ? Math.round((tasksCompleted / tasksExtracted) * 100) 
    : 0

  const overdueTasks = tasks.filter(
    t => t.status === "pending" && t.deadline && new Date(t.deadline) < new Date()
  )

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
      {/* Success Toast */}
      <UpgradeSuccessToast
        show={showSuccessToast}
        onClose={() => setShowSuccessToast(false)}
      />

      <div className="space-y-6">
        {/* Header with Upload Button */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold gradient-text mb-2">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back! Here's your productivity overview.
            </p>
          </div>
          <Link
            href="/dashboard/meetings"
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-semibold hover:shadow-lg transition-shadow flex items-center gap-2"
          >
            <Upload className="w-5 h-5" />
            Upload Meeting
          </Link>
        </div>

        {/* Row 1: 4 Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Meetings this month */}
          <div className="glass-card p-6 hover:border-blue-500/30 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-blue-500/20">
                <FileAudio className="w-6 h-6 text-blue-400" />
              </div>
            </div>
            <p className="text-3xl font-bold mb-1">
              {meetingsThisMonth} / {usage?.isPro ? "∞" : usage?.limit || 5}
            </p>
            <p className="text-sm text-muted-foreground">Meetings this month</p>
          </div>

          {/* Tasks extracted */}
          <div className="glass-card p-6 hover:border-purple-500/30 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-purple-500/20">
                <CheckCircle2 className="w-6 h-6 text-purple-400" />
              </div>
            </div>
            <p className="text-3xl font-bold mb-1">{tasksExtracted}</p>
            <p className="text-sm text-muted-foreground">Tasks extracted</p>
          </div>

          {/* Tasks completed */}
          <div className="glass-card p-6 hover:border-green-500/30 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-green-500/20">
                <CheckCircle2 className="w-6 h-6 text-green-400" />
              </div>
            </div>
            <p className="text-3xl font-bold mb-1">{tasksCompleted}</p>
            <p className="text-sm text-muted-foreground">Tasks completed</p>
          </div>

          {/* Completion rate */}
          <div className="glass-card p-6 hover:border-yellow-500/30 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-yellow-500/20">
                <Clock className="w-6 h-6 text-yellow-400" />
              </div>
            </div>
            <p className="text-3xl font-bold mb-1">{completionRate}%</p>
            <p className="text-sm text-muted-foreground">Completion rate</p>
          </div>
        </div>

        {/* Row 2: Recent Meetings Table */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Recent meetings</h2>
            <Link
              href="/dashboard/meetings"
              className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1"
            >
              View all
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {meetings.length === 0 ? (
            <div className="text-center py-12">
              <FileAudio className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-lg text-muted-foreground mb-4">
                No meetings yet. Upload your first meeting.
              </p>
              <Link
                href="/dashboard/meetings"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-semibold hover:shadow-lg transition-shadow"
              >
                <Upload className="w-5 h-5" />
                Upload Meeting
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">
                      Meeting name
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">
                      Date
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">
                      Tasks
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">
                      Status
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-muted-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {meetings.slice(0, 5).map((meeting) => {
                    const completedTasks = meeting.tasks.filter(t => t.status === "completed").length
                    const totalTasks = meeting.tasks.length
                    const completion = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
                    
                    return (
                      <tr key={meeting.id} className="border-b border-white/5 hover:bg-white/5">
                        <td className="py-4 px-4">
                          <p className="font-medium">{meeting.title}</p>
                        </td>
                        <td className="py-4 px-4 text-sm text-muted-foreground">
                          {new Date(meeting.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-4 text-sm">
                          {totalTasks} tasks ({completion}%)
                        </td>
                        <td className="py-4 px-4">
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
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
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/dashboard/meetings/${meeting.id}`}
                              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                              title="View"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={() => deleteMeeting(meeting.id)}
                              className="p-2 hover:bg-red-500/20 rounded-lg transition-colors text-red-400"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Row 3: Overdue Tasks Section */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-400" />
              Overdue tasks
            </h2>
            <Link
              href="/dashboard/tasks"
              className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1"
            >
              View all tasks
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {overdueTasks.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-3" />
              <p className="text-lg text-muted-foreground">
                No overdue tasks — great work!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {overdueTasks.map((task) => (
                <div
                  key={task.id}
                  className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 hover:border-red-500/30 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">{task.title}</h3>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span>From: {task.meetings.title}</span>
                        <span>•</span>
                        <span className="text-red-400">
                          Due: {new Date(task.deadline!).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <Link
                      href={`/dashboard/meetings/${task.meetings.id}`}
                      className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors"
                    >
                      View
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
