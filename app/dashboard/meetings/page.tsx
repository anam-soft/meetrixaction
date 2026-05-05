"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import DashboardLayout from "@/components/DashboardLayout"
import UploadMeeting from "@/components/UploadMeeting"
import UpgradeLimitModal from "@/components/UpgradeLimitModal"
import {
  Upload,
  Search,
  Eye,
  Trash2,
  Filter,
  Calendar,
  FileAudio,
} from "lucide-react"

interface Meeting {
  id: string
  title: string
  status: string
  created_at: string
  tasks: { id: string; status: string }[]
}

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [filteredMeetings, setFilteredMeetings] = useState<Meeting[]>([])
  const [loading, setLoading] = useState(true)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [showLimitModal, setShowLimitModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterPeriod, setFilterPeriod] = useState<"all" | "week" | "month">("all")
  const [canUpload, setCanUpload] = useState(true)

  useEffect(() => {
    fetchMeetings()
    checkUsage()
  }, [])

  useEffect(() => {
    filterMeetings()
  }, [meetings, searchQuery, filterPeriod])

  const fetchMeetings = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/meetings")
      const data = await res.json()
      setMeetings(data.meetings || [])
    } finally {
      setLoading(false)
    }
  }

  const checkUsage = async () => {
    const res = await fetch("/api/usage")
    const data = await res.json()
    setCanUpload(data.canUpload)
  }

  const filterMeetings = () => {
    let filtered = [...meetings]

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(m =>
        m.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Apply time period filter
    if (filterPeriod !== "all") {
      const now = new Date()
      const cutoff = new Date()
      
      if (filterPeriod === "week") {
        cutoff.setDate(now.getDate() - 7)
      } else if (filterPeriod === "month") {
        cutoff.setMonth(now.getMonth() - 1)
      }

      filtered = filtered.filter(m => new Date(m.created_at) >= cutoff)
    }

    setFilteredMeetings(filtered)
  }

  const deleteMeeting = async (meetingId: string) => {
    if (!confirm("Are you sure you want to delete this meeting? This will also delete all associated tasks.")) {
      return
    }
    
    try {
      await fetch(`/api/meetings?id=${meetingId}`, { method: "DELETE" })
      fetchMeetings()
    } catch (error) {
      console.error("Failed to delete meeting:", error)
    }
  }

  const handleUploadClick = () => {
    if (!canUpload) {
      setShowLimitModal(true)
    } else {
      setShowUploadModal(true)
    }
  }

  const handleUploadComplete = () => {
    setShowUploadModal(false)
    fetchMeetings()
    checkUsage()
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading meetings...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold gradient-text mb-2">Meetings</h1>
            <p className="text-muted-foreground">
              Manage and review your meeting recordings
            </p>
          </div>
          <button
            onClick={handleUploadClick}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-semibold hover:shadow-lg transition-shadow flex items-center gap-2"
          >
            <Upload className="w-5 h-5" />
            Upload Meeting
          </button>
        </div>

        {/* Search and Filters */}
        <div className="glass-card p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search meetings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500/50 transition-colors"
              />
            </div>

            {/* Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-muted-foreground" />
              <select
                value={filterPeriod}
                onChange={(e) => setFilterPeriod(e.target.value as any)}
                className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500/50 transition-colors"
              >
                <option value="all">All time</option>
                <option value="week">This week</option>
                <option value="month">This month</option>
              </select>
            </div>
          </div>
        </div>

        {/* Meetings Grid/Table */}
        {filteredMeetings.length === 0 ? (
          <div className="glass-card p-12">
            <div className="text-center">
              <FileAudio className="w-20 h-20 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-semibold mb-2">
                {searchQuery || filterPeriod !== "all" 
                  ? "No meetings found" 
                  : "No meetings yet"}
              </h3>
              <p className="text-muted-foreground mb-6">
                {searchQuery || filterPeriod !== "all"
                  ? "Try adjusting your search or filters"
                  : "Upload your first meeting to get started with AI-powered task extraction"}
              </p>
              {!searchQuery && filterPeriod === "all" && (
                <button
                  onClick={handleUploadClick}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-semibold hover:shadow-lg transition-shadow"
                >
                  <Upload className="w-5 h-5" />
                  Upload Meeting
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredMeetings.map((meeting) => {
              const completedTasks = meeting.tasks.filter(t => t.status === "completed").length
              const totalTasks = meeting.tasks.length
              const completion = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

              return (
                <div
                  key={meeting.id}
                  className="glass-card p-6 hover:border-purple-500/30 transition-colors"
                >
                  {/* Status Badge */}
                  <div className="flex items-start justify-between mb-4">
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
                    <div className="flex items-center gap-1">
                      <Link
                        href={`/dashboard/meetings/${meeting.id}`}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        title="View details"
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
                  </div>

                  {/* Meeting Info */}
                  <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                    {meeting.title}
                  </h3>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                    <Calendar className="w-4 h-4" />
                    {new Date(meeting.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </div>

                  {/* Tasks Progress */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Tasks</span>
                      <span className="font-medium">
                        {completedTasks} / {totalTasks}
                      </span>
                    </div>
                    <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-600 to-pink-600 transition-all duration-300"
                        style={{ width: `${completion}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground text-right">
                      {completion}% complete
                    </p>
                  </div>

                  {/* View Button */}
                  <Link
                    href={`/dashboard/meetings/${meeting.id}`}
                    className="mt-4 w-full block text-center px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg font-medium transition-colors"
                  >
                    View Details
                  </Link>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-black/90 border border-white/10 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold gradient-text">Upload Meeting</h2>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  ✕
                </button>
              </div>
              <UploadMeeting onComplete={handleUploadComplete} />
            </div>
          </div>
        </div>
      )}

      {/* Limit Modal */}
      <UpgradeLimitModal
        show={showLimitModal}
        onClose={() => setShowLimitModal(false)}
      />
    </DashboardLayout>
  )
}
