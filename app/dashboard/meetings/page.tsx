"use client"

import { useEffect, useState, useRef } from "react"
import DashboardLayout from "@/components/DashboardLayout"
import {
  Upload,
  FileAudio,
  Search,
  Filter,
  MoreVertical,
  Trash2,
  RefreshCw,
  Eye,
  X,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
} from "lucide-react"

interface Meeting {
  id: string
  title: string
  status: string
  created_at: string
  summary: string | null
  transcript: string | null
  decisions: string | null
  duration: number | null
  tasks: { id: string; status: string; title: string }[]
}

interface Usage {
  canUpload: boolean
  currentUsage: number
  limit: number
  isPro: boolean
}

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [usage, setUsage] = useState<Usage | null>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showLimitModal, setShowLimitModal] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      await Promise.all([fetchMeetings(), fetchUsage()])
    } finally {
      setLoading(false)
    }
  }

  const fetchMeetings = async () => {
    const res = await fetch("/api/meetings")
    const data = await res.json()
    setMeetings(data.meetings || [])
  }

  const fetchUsage = async () => {
    const res = await fetch("/api/usage")
    const data = await res.json()
    setUsage(data)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  const handleUploadClick = () => {
    if (usage && !usage.canUpload) {
      setShowLimitModal(true)
      return
    }
    setShowUploadModal(true)
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", selectedFile)
      formData.append("title", selectedFile.name)

      const res = await fetch("/api/meetings", {
        method: "POST",
        body: formData,
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || "Upload failed")
      }

      const data = await res.json()

      // Start processing
      await fetch(`/api/meetings/${data.meeting.id}/process`, {
        method: "POST",
      })

      setSelectedFile(null)
      setShowUploadModal(false)
      fetchData()
    } catch (error: any) {
      alert(error.message || "Upload failed")
    } finally {
      setUploading(false)
    }
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

  const handleReprocess = async (meetingId: string) => {
    try {
      await fetch(`/api/meetings/${meetingId}/process`, {
        method: "POST",
      })
      fetchMeetings()
      alert("Reprocessing started!")
    } catch (error) {
      alert("Failed to reprocess meeting")
    }
  }

  const handleDelete = async (meetingId: string) => {
    if (!confirm("Are you sure you want to delete this meeting?")) return

    try {
      await fetch(`/api/meetings?id=${meetingId}`, {
        method: "DELETE",
      })
      fetchMeetings()
    } catch (error) {
      alert("Failed to delete meeting")
    }
  }

  const filteredMeetings = meetings.filter((meeting) => {
    const matchesSearch = meeting.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
    const matchesStatus =
      statusFilter === "all" || meeting.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "done":
        return <CheckCircle2 className="w-4 h-4 text-green-400" />
      case "processing":
        return <Clock className="w-4 h-4 text-yellow-400 animate-spin" />
      case "failed":
        return <AlertCircle className="w-4 h-4 text-red-400" />
      default:
        return <Clock className="w-4 h-4 text-blue-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "done":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "processing":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      case "failed":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      default:
        return "bg-blue-500/20 text-blue-400 border-blue-500/30"
    }
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
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold gradient-text mb-2">Meetings</h1>
            <p className="text-muted-foreground">
              Manage and process your meeting recordings
            </p>
          </div>
          <button
            onClick={handleUploadClick}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-semibold hover:shadow-lg transition-shadow flex items-center gap-2 whitespace-nowrap"
          >
            <Upload className="w-5 h-5" />
            Upload Meeting
          </button>
        </div>

        {/* Usage Info */}
        {usage && !usage.isPro && (
          <div className="glass-card p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                <span className="text-lg font-bold text-purple-400">
                  {usage.currentUsage}/{usage.limit}
                </span>
              </div>
              <div>
                <p className="font-medium">Meetings Used This Month</p>
                <p className="text-sm text-muted-foreground">
                  {usage.canUpload
                    ? `${usage.limit - usage.currentUsage} remaining`
                    : "Limit reached"}
                </p>
              </div>
            </div>
            {!usage.canUpload && (
              <button
                onClick={handleUpgrade}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-semibold hover:shadow-lg transition-shadow text-sm"
              >
                Upgrade to Pro
              </button>
            )}
          </div>
        )}

        {/* Filters */}
        <div className="glass-card p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search meetings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500/50"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-muted-foreground" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500/50"
              >
                <option value="all">All Status</option>
                <option value="uploaded">Uploaded</option>
                <option value="processing">Processing</option>
                <option value="done">Completed</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Meetings Table */}
        {filteredMeetings.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <FileAudio className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-semibold mb-2">No meetings found</h3>
            <p className="text-muted-foreground mb-6">
              {searchQuery || statusFilter !== "all"
                ? "Try adjusting your filters"
                : "Upload your first meeting to get started"}
            </p>
            {!searchQuery && statusFilter === "all" && (
              <button
                onClick={handleUploadClick}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-semibold hover:shadow-lg transition-shadow inline-flex items-center gap-2"
              >
                <Upload className="w-5 h-5" />
                Upload Meeting
              </button>
            )}
          </div>
        ) : (
          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left p-4 font-semibold text-sm text-muted-foreground">
                      Title
                    </th>
                    <th className="text-left p-4 font-semibold text-sm text-muted-foreground">
                      Date
                    </th>
                    <th className="text-left p-4 font-semibold text-sm text-muted-foreground">
                      Status
                    </th>
                    <th className="text-left p-4 font-semibold text-sm text-muted-foreground">
                      Tasks
                    </th>
                    <th className="text-left p-4 font-semibold text-sm text-muted-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMeetings.map((meeting) => (
                    <tr
                      key={meeting.id}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-purple-500/20">
                            <FileAudio className="w-4 h-4 text-purple-400" />
                          </div>
                          <div>
                            <p className="font-medium">{meeting.title}</p>
                            {meeting.duration && (
                              <p className="text-xs text-muted-foreground">
                                {Math.round(meeting.duration / 60)} min
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">
                        {new Date(meeting.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                            meeting.status
                          )}`}
                        >
                          {getStatusIcon(meeting.status)}
                          {meeting.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="text-sm">
                          {meeting.tasks.length} tasks
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedMeeting(meeting)
                              setShowDetailModal(true)
                            }}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                            title="View details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {meeting.status === "failed" && (
                            <button
                              onClick={() => handleReprocess(meeting.id)}
                              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                              title="Reprocess"
                            >
                              <RefreshCw className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(meeting.id)}
                            className="p-2 hover:bg-red-500/20 rounded-lg transition-colors text-red-400"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card p-6 max-w-lg w-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Upload Meeting</h2>
              <button
                onClick={() => {
                  setShowUploadModal(false)
                  setSelectedFile(null)
                }}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Select audio/video file
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="audio/*,video/mp4"
                  onChange={handleFileSelect}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500/50"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Supported formats: MP3, WAV, MP4 (max 100MB)
                </p>
              </div>

              {selectedFile && (
                <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/30">
                  <div className="flex items-center gap-3">
                    <FileAudio className="w-8 h-8 text-purple-400" />
                    <div className="flex-1">
                      <p className="font-medium">{selectedFile.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowUploadModal(false)
                    setSelectedFile(null)
                  }}
                  className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpload}
                  disabled={!selectedFile || uploading}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-shadow"
                >
                  {uploading ? "Uploading..." : "Upload & Process"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedMeeting && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="glass-card p-6 max-w-3xl w-full my-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">{selectedMeeting.title}</h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Status & Info */}
              <div className="flex items-center gap-4 text-sm">
                <span
                  className={`inline-flex items-center gap-2 px-3 py-1 rounded-full font-medium border ${getStatusColor(
                    selectedMeeting.status
                  )}`}
                >
                  {getStatusIcon(selectedMeeting.status)}
                  {selectedMeeting.status}
                </span>
                <span className="text-muted-foreground">
                  {new Date(selectedMeeting.created_at).toLocaleString()}
                </span>
                {selectedMeeting.duration && (
                  <span className="text-muted-foreground">
                    {Math.round(selectedMeeting.duration / 60)} min
                  </span>
                )}
              </div>

              {/* Summary */}
              {selectedMeeting.summary && (
                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Summary
                  </h3>
                  <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {selectedMeeting.summary}
                    </p>
                  </div>
                </div>
              )}

              {/* Decisions */}
              {selectedMeeting.decisions && (
                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Key Decisions
                  </h3>
                  <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {selectedMeeting.decisions}
                    </p>
                  </div>
                </div>
              )}

              {/* Tasks */}
              {selectedMeeting.tasks.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">
                    Action Items ({selectedMeeting.tasks.length})
                  </h3>
                  <div className="space-y-2">
                    {selectedMeeting.tasks.map((task) => (
                      <div
                        key={task.id}
                        className="p-3 rounded-lg bg-white/5 border border-white/10 flex items-center gap-3"
                      >
                        {task.status === "completed" ? (
                          <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border-2 border-muted-foreground flex-shrink-0" />
                        )}
                        <span
                          className={`text-sm ${
                            task.status === "completed"
                              ? "line-through text-muted-foreground"
                              : ""
                          }`}
                        >
                          {task.title}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Transcript */}
              {selectedMeeting.transcript && (
                <div>
                  <h3 className="font-semibold mb-2">Transcript</h3>
                  <div className="p-4 rounded-lg bg-white/5 border border-white/10 max-h-96 overflow-y-auto">
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {selectedMeeting.transcript}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Limit Modal */}
      {showLimitModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card p-6 max-w-md w-full">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-400" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Limit Reached</h2>
              <p className="text-muted-foreground mb-6">
                You've reached your limit of {usage?.limit} meetings per month.
                Upgrade to Pro for unlimited meetings and advanced features.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowLimitModal(false)}
                  className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpgrade}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-semibold hover:shadow-lg transition-shadow"
                >
                  Upgrade to Pro
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
