"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import DashboardLayout from "@/components/DashboardLayout"
import {
  User,
  Bell,
  Shield,
  Trash2,
  Save,
  AlertCircle,
  CheckCircle2,
  Mail,
  Loader2,
} from "lucide-react"

interface NotificationSettings {
  emailReminders: boolean
  taskDeadlines: boolean
  meetingProcessed: boolean
  weeklyDigest: boolean
}

export default function SettingsPage() {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState("")
  const [saveMessage, setSaveMessage] = useState<{
    type: "success" | "error"
    text: string
  } | null>(null)

  const [notifications, setNotifications] = useState<NotificationSettings>({
    emailReminders: true,
    taskDeadlines: true,
    meetingProcessed: true,
    weeklyDigest: false,
  })

  useEffect(() => {
    // Load user settings from localStorage or API
    const savedSettings = localStorage.getItem("notificationSettings")
    if (savedSettings) {
      setNotifications(JSON.parse(savedSettings))
    }
  }, [])

  const handleSaveNotifications = async () => {
    setSaving(true)
    setSaveMessage(null)

    try {
      // Save to localStorage (in production, save to API)
      localStorage.setItem("notificationSettings", JSON.stringify(notifications))

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setSaveMessage({
        type: "success",
        text: "Settings saved successfully!",
      })

      setTimeout(() => setSaveMessage(null), 3000)
    } catch (error) {
      setSaveMessage({
        type: "error",
        text: "Failed to save settings. Please try again.",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "DELETE") {
      alert('Please type "DELETE" to confirm')
      return
    }

    try {
      // In production, call API to delete account
      alert(
        "Account deletion would be processed here. This is a demo, so your account is safe!"
      )
      setShowDeleteConfirm(false)
      setDeleteConfirmText("")
    } catch (error) {
      alert("Failed to delete account. Please contact support.")
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold gradient-text mb-2">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account and preferences
          </p>
        </div>

        {/* Profile Section */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-lg bg-purple-500/20">
              <User className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Profile</h2>
              <p className="text-sm text-muted-foreground">
                Your account information
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Name</label>
                <div className="px-4 py-3 bg-white/5 border border-white/10 rounded-lg">
                  <p className="text-sm">
                    {session?.user?.name || "Not set"}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <div className="px-4 py-3 bg-white/5 border border-white/10 rounded-lg">
                  <p className="text-sm">
                    {session?.user?.email || "Not set"}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-400">
                    Secure Authentication
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Your profile information is securely stored. To update your
                    password or account details, please contact support.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Notifications Section */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-lg bg-green-500/20">
              <Bell className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Notifications</h2>
              <p className="text-sm text-muted-foreground">
                Manage your notification preferences
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Email Reminders</p>
                  <p className="text-sm text-muted-foreground">
                    Receive email notifications for important updates
                  </p>
                </div>
              </div>
              <button
                onClick={() =>
                  setNotifications({
                    ...notifications,
                    emailReminders: !notifications.emailReminders,
                  })
                }
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  notifications.emailReminders
                    ? "bg-purple-600"
                    : "bg-white/10"
                }`}
              >
                <div
                  className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                    notifications.emailReminders ? "translate-x-6" : ""
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Task Deadline Reminders</p>
                  <p className="text-sm text-muted-foreground">
                    Get notified when tasks are approaching their deadline
                  </p>
                </div>
              </div>
              <button
                onClick={() =>
                  setNotifications({
                    ...notifications,
                    taskDeadlines: !notifications.taskDeadlines,
                  })
                }
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  notifications.taskDeadlines ? "bg-purple-600" : "bg-white/10"
                }`}
              >
                <div
                  className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                    notifications.taskDeadlines ? "translate-x-6" : ""
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Meeting Processed</p>
                  <p className="text-sm text-muted-foreground">
                    Notification when meeting processing is complete
                  </p>
                </div>
              </div>
              <button
                onClick={() =>
                  setNotifications({
                    ...notifications,
                    meetingProcessed: !notifications.meetingProcessed,
                  })
                }
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  notifications.meetingProcessed
                    ? "bg-purple-600"
                    : "bg-white/10"
                }`}
              >
                <div
                  className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                    notifications.meetingProcessed ? "translate-x-6" : ""
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Weekly Digest</p>
                  <p className="text-sm text-muted-foreground">
                    Receive a weekly summary of your productivity
                  </p>
                </div>
              </div>
              <button
                onClick={() =>
                  setNotifications({
                    ...notifications,
                    weeklyDigest: !notifications.weeklyDigest,
                  })
                }
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  notifications.weeklyDigest ? "bg-purple-600" : "bg-white/10"
                }`}
              >
                <div
                  className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                    notifications.weeklyDigest ? "translate-x-6" : ""
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between mt-6 pt-6 border-t border-white/10">
            {saveMessage && (
              <div
                className={`flex items-center gap-2 text-sm ${
                  saveMessage.type === "success"
                    ? "text-green-400"
                    : "text-red-400"
                }`}
              >
                {saveMessage.type === "success" ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <AlertCircle className="w-4 h-4" />
                )}
                {saveMessage.text}
              </div>
            )}
            <div className="flex-1" />
            <button
              onClick={handleSaveNotifications}
              disabled={saving}
              className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-semibold hover:shadow-lg transition-shadow disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="glass-card p-6 border-red-500/30 bg-red-500/5">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-lg bg-red-500/20">
              <Trash2 className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-red-400">Danger Zone</h2>
              <p className="text-sm text-muted-foreground">
                Irreversible and destructive actions
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30">
              <div className="flex items-start gap-3 mb-4">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-red-400">Delete Account</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Permanently delete your account and all associated data. This
                    action cannot be undone.
                  </p>
                </div>
              </div>

              {!showDeleteConfirm ? (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg font-semibold transition-colors border border-red-500/30"
                >
                  Delete Account
                </button>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-red-400">
                      Type "DELETE" to confirm
                    </label>
                    <input
                      type="text"
                      value={deleteConfirmText}
                      onChange={(e) => setDeleteConfirmText(e.target.value)}
                      placeholder="DELETE"
                      className="w-full px-4 py-2 bg-white/5 border border-red-500/30 rounded-lg focus:outline-none focus:border-red-500/50"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setShowDeleteConfirm(false)
                        setDeleteConfirmText("")
                      }}
                      className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg font-semibold transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDeleteAccount}
                      disabled={deleteConfirmText !== "DELETE"}
                      className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Permanently Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* About */}
        <div className="glass-card p-6">
          <h2 className="text-xl font-bold mb-4">About</h2>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>
              <span className="font-medium text-foreground">Version:</span> 1.0.0
            </p>
            <p>
              <span className="font-medium text-foreground">Last Updated:</span>{" "}
              {new Date().toLocaleDateString()}
            </p>
            <p className="pt-2">
              AI Meeting Action Tracker - Transform your meetings into actionable
              insights with AI-powered transcription and task extraction.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
