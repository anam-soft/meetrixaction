"use client"

import { useEffect, useState } from "react"
import DashboardLayout from "@/components/DashboardLayout"
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  Calendar,
  CheckCircle2,
  Clock,
  Users,
  Target,
} from "lucide-react"

interface Task {
  id: string
  status: string
  created_at: string
  completed_at: string | null
  deadline: string | null
}

interface Meeting {
  id: string
  created_at: string
  tasks: Task[]
}

interface Analytics {
  totalMeetings: number
  totalTasks: number
  completedTasks: number
  pendingTasks: number
  overdueTasks: number
  completionRate: number
  avgTasksPerMeeting: number
  avgCompletionTime: number
  weeklyMeetings: { week: string; count: number }[]
  weeklyTasks: { week: string; completed: number; created: number }[]
  tasksByPriority: { priority: string; count: number }[]
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d">("30d")

  useEffect(() => {
    fetchAnalytics()
  }, [timeRange])

  const fetchAnalytics = async () => {
    setLoading(true)
    try {
      // Fetch meetings and tasks
      const [meetingsRes, tasksRes] = await Promise.all([
        fetch("/api/meetings"),
        fetch("/api/tasks"),
      ])

      const meetingsData = await meetingsRes.json()
      const tasksData = await tasksRes.json()

      const meetings: Meeting[] = meetingsData.meetings || []
      const tasks: Task[] = tasksData.tasks || []

      // Calculate analytics
      const now = new Date()
      const daysAgo = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90
      const startDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000)

      const filteredMeetings = meetings.filter(
        (m) => new Date(m.created_at) >= startDate
      )
      const filteredTasks = tasks.filter(
        (t) => new Date(t.created_at) >= startDate
      )

      const completedTasks = filteredTasks.filter(
        (t) => t.status === "completed"
      )
      const pendingTasks = filteredTasks.filter((t) => t.status === "pending")
      const overdueTasks = pendingTasks.filter(
        (t) => t.deadline && new Date(t.deadline) < now
      )

      // Calculate completion rate
      const completionRate =
        filteredTasks.length > 0
          ? Math.round((completedTasks.length / filteredTasks.length) * 100)
          : 0

      // Calculate average tasks per meeting
      const avgTasksPerMeeting =
        filteredMeetings.length > 0
          ? Math.round(
              (filteredTasks.length / filteredMeetings.length) * 10
            ) / 10
          : 0

      // Calculate average completion time (in days)
      const completionTimes = completedTasks
        .filter((t) => t.completed_at)
        .map((t) => {
          const created = new Date(t.created_at).getTime()
          const completed = new Date(t.completed_at!).getTime()
          return (completed - created) / (1000 * 60 * 60 * 24)
        })

      const avgCompletionTime =
        completionTimes.length > 0
          ? Math.round(
              (completionTimes.reduce((a, b) => a + b, 0) /
                completionTimes.length) *
                10
            ) / 10
          : 0

      // Generate weekly data
      const weeklyMeetings = generateWeeklyData(filteredMeetings, daysAgo)
      const weeklyTasks = generateWeeklyTaskData(filteredTasks, daysAgo)

      setAnalytics({
        totalMeetings: filteredMeetings.length,
        totalTasks: filteredTasks.length,
        completedTasks: completedTasks.length,
        pendingTasks: pendingTasks.length,
        overdueTasks: overdueTasks.length,
        completionRate,
        avgTasksPerMeeting,
        avgCompletionTime,
        weeklyMeetings,
        weeklyTasks,
        tasksByPriority: [],
      })
    } finally {
      setLoading(false)
    }
  }

  const generateWeeklyData = (meetings: Meeting[], days: number) => {
    const weeks = Math.ceil(days / 7)
    const data = []

    for (let i = 0; i < weeks; i++) {
      const weekStart = new Date()
      weekStart.setDate(weekStart.getDate() - (weeks - i) * 7)
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekEnd.getDate() + 7)

      const count = meetings.filter((m) => {
        const date = new Date(m.created_at)
        return date >= weekStart && date < weekEnd
      }).length

      data.push({
        week: `Week ${i + 1}`,
        count,
      })
    }

    return data
  }

  const generateWeeklyTaskData = (tasks: Task[], days: number) => {
    const weeks = Math.ceil(days / 7)
    const data = []

    for (let i = 0; i < weeks; i++) {
      const weekStart = new Date()
      weekStart.setDate(weekStart.getDate() - (weeks - i) * 7)
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekEnd.getDate() + 7)

      const created = tasks.filter((t) => {
        const date = new Date(t.created_at)
        return date >= weekStart && date < weekEnd
      }).length

      const completed = tasks.filter((t) => {
        if (!t.completed_at) return false
        const date = new Date(t.completed_at)
        return date >= weekStart && date < weekEnd
      }).length

      data.push({
        week: `Week ${i + 1}`,
        created,
        completed,
      })
    }

    return data
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading analytics...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!analytics) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Failed to load analytics</p>
        </div>
      </DashboardLayout>
    )
  }

  const maxWeeklyMeetings = Math.max(
    ...analytics.weeklyMeetings.map((w) => w.count),
    1
  )
  const maxWeeklyTasks = Math.max(
    ...analytics.weeklyTasks.map((w) => Math.max(w.created, w.completed)),
    1
  )

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold gradient-text mb-2">Analytics</h1>
            <p className="text-muted-foreground">
              Track your productivity and performance
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setTimeRange("7d")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                timeRange === "7d"
                  ? "bg-gradient-to-r from-purple-600 to-pink-600"
                  : "bg-white/5 hover:bg-white/10"
              }`}
            >
              7 Days
            </button>
            <button
              onClick={() => setTimeRange("30d")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                timeRange === "30d"
                  ? "bg-gradient-to-r from-purple-600 to-pink-600"
                  : "bg-white/5 hover:bg-white/10"
              }`}
            >
              30 Days
            </button>
            <button
              onClick={() => setTimeRange("90d")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                timeRange === "90d"
                  ? "bg-gradient-to-r from-purple-600 to-pink-600"
                  : "bg-white/5 hover:bg-white/10"
              }`}
            >
              90 Days
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-purple-500/20">
                <Target className="w-6 h-6 text-purple-400" />
              </div>
              <div className="flex items-center gap-1 text-green-400 text-sm">
                <TrendingUp className="w-4 h-4" />
                <span>{analytics.completionRate}%</span>
              </div>
            </div>
            <p className="text-3xl font-bold mb-1">
              {analytics.completionRate}%
            </p>
            <p className="text-sm text-muted-foreground">Completion Rate</p>
          </div>

          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-blue-500/20">
                <BarChart3 className="w-6 h-6 text-blue-400" />
              </div>
            </div>
            <p className="text-3xl font-bold mb-1">
              {analytics.avgTasksPerMeeting}
            </p>
            <p className="text-sm text-muted-foreground">Tasks per Meeting</p>
          </div>

          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-green-500/20">
                <Clock className="w-6 h-6 text-green-400" />
              </div>
            </div>
            <p className="text-3xl font-bold mb-1">
              {analytics.avgCompletionTime}
            </p>
            <p className="text-sm text-muted-foreground">
              Avg. Completion (days)
            </p>
          </div>

          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-yellow-500/20">
                <Calendar className="w-6 h-6 text-yellow-400" />
              </div>
            </div>
            <p className="text-3xl font-bold mb-1">
              {analytics.totalMeetings}
            </p>
            <p className="text-sm text-muted-foreground">Total Meetings</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Meetings Over Time */}
          <div className="glass-card p-6">
            <h2 className="text-xl font-bold mb-6">Meetings Over Time</h2>
            <div className="space-y-4">
              {analytics.weeklyMeetings.map((week, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">
                      {week.week}
                    </span>
                    <span className="text-sm font-medium">{week.count}</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-600 to-pink-600 rounded-full transition-all duration-500"
                      style={{
                        width: `${(week.count / maxWeeklyMeetings) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Task Activity */}
          <div className="glass-card p-6">
            <h2 className="text-xl font-bold mb-6">Task Activity</h2>
            <div className="space-y-4">
              {analytics.weeklyTasks.map((week, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">
                      {week.week}
                    </span>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-green-400">
                        ✓ {week.completed}
                      </span>
                      <span className="text-blue-400">+ {week.created}</span>
                    </div>
                  </div>
                  <div className="flex gap-1 h-2">
                    <div
                      className="bg-green-500/50 rounded-full transition-all duration-500"
                      style={{
                        width: `${(week.completed / maxWeeklyTasks) * 100}%`,
                      }}
                    />
                    <div
                      className="bg-blue-500/50 rounded-full transition-all duration-500"
                      style={{
                        width: `${(week.created / maxWeeklyTasks) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-4 mt-6 pt-4 border-t border-white/10 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500/50" />
                <span className="text-muted-foreground">Completed</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500/50" />
                <span className="text-muted-foreground">Created</span>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="glass-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-lg bg-green-500/20">
                <CheckCircle2 className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{analytics.completedTasks}</p>
                <p className="text-sm text-muted-foreground">
                  Tasks Completed
                </p>
              </div>
            </div>
            <div className="text-xs text-muted-foreground">
              Out of {analytics.totalTasks} total tasks
            </div>
          </div>

          <div className="glass-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-lg bg-yellow-500/20">
                <Clock className="w-6 h-6 text-yellow-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{analytics.pendingTasks}</p>
                <p className="text-sm text-muted-foreground">Pending Tasks</p>
              </div>
            </div>
            <div className="text-xs text-muted-foreground">
              Currently in progress
            </div>
          </div>

          <div className="glass-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-lg bg-red-500/20">
                <TrendingDown className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{analytics.overdueTasks}</p>
                <p className="text-sm text-muted-foreground">Overdue Tasks</p>
              </div>
            </div>
            <div className="text-xs text-muted-foreground">
              {analytics.overdueTasks > 0
                ? "Needs immediate attention"
                : "All tasks on track"}
            </div>
          </div>
        </div>

        {/* Insights */}
        <div className="glass-card p-6">
          <h2 className="text-xl font-bold mb-4">Productivity Insights</h2>
          <div className="space-y-3">
            {analytics.completionRate >= 80 && (
              <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30">
                <div className="flex items-start gap-3">
                  <TrendingUp className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-green-400">
                      Excellent Performance!
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Your completion rate of {analytics.completionRate}% is
                      outstanding. Keep up the great work!
                    </p>
                  </div>
                </div>
              </div>
            )}

            {analytics.overdueTasks > 0 && (
              <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30">
                <div className="flex items-start gap-3">
                  <TrendingDown className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-red-400">
                      Overdue Tasks Detected
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      You have {analytics.overdueTasks} overdue task
                      {analytics.overdueTasks > 1 ? "s" : ""}. Consider
                      prioritizing these to stay on track.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {analytics.avgTasksPerMeeting > 5 && (
              <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
                <div className="flex items-start gap-3">
                  <BarChart3 className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-400">
                      High Action Item Generation
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Your meetings generate an average of{" "}
                      {analytics.avgTasksPerMeeting} action items. This shows
                      productive discussions!
                    </p>
                  </div>
                </div>
              </div>
            )}

            {analytics.totalMeetings === 0 && (
              <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-yellow-400">
                      No Data Available
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Upload your first meeting to start tracking your
                      productivity metrics.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
