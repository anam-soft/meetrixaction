"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import DashboardLayout from "@/components/DashboardLayout"
import {
  CheckCircle2,
  Circle,
  Filter,
  Search,
  Trash2,
  Users as UsersIcon,
  Calendar,
  AlertCircle,
  Clock,
} from "lucide-react"

interface Task {
  id: string
  title: string
  description: string | null
  status: string
  priority: string
  deadline: string | null
  assignee_id: string | null
  meetings: { id: string; title: string }
  users: { id: string; name: string; avatar: string | null } | null
}

type FilterType = "all" | "my-tasks" | "overdue" | "completed"

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState<FilterType>("all")
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchTasks()
  }, [])

  useEffect(() => {
    filterTasks()
  }, [tasks, searchQuery, filterType])

  const fetchTasks = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/tasks")
      const data = await res.json()
      setTasks(data.tasks || [])
    } finally {
      setLoading(false)
    }
  }

  const filterTasks = () => {
    let filtered = [...tasks]

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(t =>
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.meetings.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Apply type filter
    switch (filterType) {
      case "my-tasks":
        filtered = filtered.filter(t => t.assignee_id !== null)
        break
      case "overdue":
        filtered = filtered.filter(
          t => t.status === "pending" && t.deadline && new Date(t.deadline) < new Date()
        )
        break
      case "completed":
        filtered = filtered.filter(t => t.status === "completed")
        break
    }

    setFilteredTasks(filtered)
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

  const toggleSelectTask = (taskId: string) => {
    const newSelected = new Set(selectedTasks)
    if (newSelected.has(taskId)) {
      newSelected.delete(taskId)
    } else {
      newSelected.add(taskId)
    }
    setSelectedTasks(newSelected)
  }

  const toggleSelectAll = () => {
    if (selectedTasks.size === filteredTasks.length) {
      setSelectedTasks(new Set())
    } else {
      setSelectedTasks(new Set(filteredTasks.map(t => t.id)))
    }
  }

  const bulkMarkComplete = async () => {
    if (selectedTasks.size === 0) return

    await Promise.all(
      Array.from(selectedTasks).map(taskId =>
        fetch("/api/tasks", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ taskId, status: "completed" }),
        })
      )
    )

    setSelectedTasks(new Set())
    fetchTasks()
  }

  const bulkDelete = async () => {
    if (selectedTasks.size === 0) return
    if (!confirm(`Delete ${selectedTasks.size} task(s)?`)) return

    await Promise.all(
      Array.from(selectedTasks).map(taskId =>
        fetch(`/api/tasks?id=${taskId}`, { method: "DELETE" })
      )
    )

    setSelectedTasks(new Set())
    fetchTasks()
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500/20 text-red-400"
      case "medium":
        return "bg-yellow-500/20 text-yellow-400"
      case "low":
        return "bg-green-500/20 text-green-400"
      default:
        return "bg-gray-500/20 text-gray-400"
    }
  }

  const getFilterCount = (type: FilterType) => {
    switch (type) {
      case "all":
        return tasks.length
      case "my-tasks":
        return tasks.filter(t => t.assignee_id !== null).length
      case "overdue":
        return tasks.filter(
          t => t.status === "pending" && t.deadline && new Date(t.deadline) < new Date()
        ).length
      case "completed":
        return tasks.filter(t => t.status === "completed").length
      default:
        return 0
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading tasks...</p>
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
          <h1 className="text-3xl font-bold gradient-text mb-2">All Tasks</h1>
          <p className="text-muted-foreground">
            Manage and track all your action items
          </p>
        </div>

        {/* Search and Filters */}
        <div className="glass-card p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500/50 transition-colors"
              />
            </div>

            {/* Filter Buttons */}
            <div className="flex gap-2 overflow-x-auto">
              <button
                onClick={() => setFilterType("all")}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                  filterType === "all"
                    ? "bg-gradient-to-r from-purple-600/20 to-pink-600/20 text-foreground border border-purple-500/30"
                    : "bg-white/5 text-muted-foreground hover:text-foreground hover:bg-white/10"
                }`}
              >
                All ({getFilterCount("all")})
              </button>
              <button
                onClick={() => setFilterType("my-tasks")}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                  filterType === "my-tasks"
                    ? "bg-gradient-to-r from-purple-600/20 to-pink-600/20 text-foreground border border-purple-500/30"
                    : "bg-white/5 text-muted-foreground hover:text-foreground hover:bg-white/10"
                }`}
              >
                My Tasks ({getFilterCount("my-tasks")})
              </button>
              <button
                onClick={() => setFilterType("overdue")}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                  filterType === "overdue"
                    ? "bg-gradient-to-r from-purple-600/20 to-pink-600/20 text-foreground border border-purple-500/30"
                    : "bg-white/5 text-muted-foreground hover:text-foreground hover:bg-white/10"
                }`}
              >
                Overdue ({getFilterCount("overdue")})
              </button>
              <button
                onClick={() => setFilterType("completed")}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                  filterType === "completed"
                    ? "bg-gradient-to-r from-purple-600/20 to-pink-600/20 text-foreground border border-purple-500/30"
                    : "bg-white/5 text-muted-foreground hover:text-foreground hover:bg-white/10"
                }`}
              >
                Completed ({getFilterCount("completed")})
              </button>
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedTasks.size > 0 && (
          <div className="glass-card p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {selectedTasks.size} task(s) selected
              </p>
              <div className="flex gap-2">
                <button
                  onClick={bulkMarkComplete}
                  className="px-4 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors font-medium"
                >
                  Mark Complete
                </button>
                <button
                  onClick={bulkDelete}
                  className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tasks Table */}
        <div className="glass-card overflow-hidden">
          {filteredTasks.length === 0 ? (
            <div className="text-center py-12 px-4">
              <CheckCircle2 className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-semibold mb-2">
                {searchQuery || filterType !== "all" 
                  ? "No tasks found" 
                  : "No tasks yet"}
              </h3>
              <p className="text-muted-foreground">
                {searchQuery || filterType !== "all"
                  ? "Try adjusting your search or filters"
                  : "Upload a meeting to generate action items"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-4 px-4 w-12">
                      <input
                        type="checkbox"
                        checked={selectedTasks.size === filteredTasks.length}
                        onChange={toggleSelectAll}
                        className="w-4 h-4 rounded border-white/20 bg-white/5 cursor-pointer"
                      />
                    </th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-muted-foreground">
                      Task
                    </th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-muted-foreground">
                      Meeting Source
                    </th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-muted-foreground">
                      Assignee
                    </th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-muted-foreground">
                      Due Date
                    </th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-muted-foreground">
                      Priority
                    </th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-muted-foreground">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTasks.map((task) => {
                    const isOverdue = task.status === "pending" && 
                      task.deadline && 
                      new Date(task.deadline) < new Date()

                    return (
                      <tr
                        key={task.id}
                        className="border-b border-white/5 hover:bg-white/5 transition-colors"
                      >
                        <td className="py-4 px-4">
                          <input
                            type="checkbox"
                            checked={selectedTasks.has(task.id)}
                            onChange={() => toggleSelectTask(task.id)}
                            className="w-4 h-4 rounded border-white/20 bg-white/5 cursor-pointer"
                          />
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-start gap-3">
                            <button
                              onClick={() => toggleTaskStatus(task.id, task.status)}
                              className="mt-1 flex-shrink-0"
                            >
                              {task.status === "completed" ? (
                                <CheckCircle2 className="w-5 h-5 text-green-400" />
                              ) : (
                                <Circle className="w-5 h-5 text-muted-foreground hover:text-purple-400 transition-colors" />
                              )}
                            </button>
                            <div>
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
                                <p className="text-sm text-muted-foreground mt-1">
                                  {task.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <Link
                            href={`/dashboard/meetings/${task.meetings.id}`}
                            className="text-sm text-purple-400 hover:text-purple-300 hover:underline"
                          >
                            {task.meetings.title}
                          </Link>
                        </td>
                        <td className="py-4 px-4">
                          {task.users ? (
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-sm font-semibold">
                                {task.users.name.charAt(0).toUpperCase()}
                              </div>
                              <span className="text-sm">{task.users.name}</span>
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">Unassigned</span>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          {task.deadline ? (
                            <div className="flex items-center gap-2">
                              {isOverdue && (
                                <AlertCircle className="w-4 h-4 text-red-400" />
                              )}
                              <span
                                className={`text-sm ${
                                  isOverdue ? "text-red-400 font-medium" : "text-muted-foreground"
                                }`}
                              >
                                {new Date(task.deadline).toLocaleDateString()}
                              </span>
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">No deadline</span>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(
                              task.priority
                            )}`}
                          >
                            {task.priority}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              task.status === "completed"
                                ? "bg-green-500/20 text-green-400"
                                : "bg-yellow-500/20 text-yellow-400"
                            }`}
                          >
                            {task.status}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
