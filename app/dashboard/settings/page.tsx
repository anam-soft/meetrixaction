"use client"

import { useEffect, useState } from "react"
import { useUser } from "@clerk/nextjs"
import DashboardLayout from "@/components/DashboardLayout"
import {
  User,
  Bell,
  Link as LinkIcon,
  CreditCard,
  Save,
  Check,
  ExternalLink,
  MessageSquare,
  Calendar as CalendarIcon,
  Video,
} from "lucide-react"

type TabType = "profile" | "notifications" | "integrations" | "billing"

interface NotificationSettings {
  weeklyDigest: boolean
  digestDay: string
  digestTime: string
  overdueReminders: boolean
  reminderFrequency: string
  taskAssigned: boolean
}

interface Integration {
  name: string
  icon: any
  connected: boolean
  description: string
}

export default function SettingsPage() {
  const { user } = useUser()
  const [activeTab, setActiveTab] = useState<TabType>("profile")
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  // Profile state
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")

  // Notification settings
  const [notifications, setNotifications] = useState<NotificationSettings>({
    weeklyDigest: true,
    digestDay: "monday",
    digestTime: "09:00",
    overdueReminders: true,
    reminderFrequency: "daily",
    taskAssigned: true,
  })

  // Integrations
  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      name: "Slack",
      icon: MessageSquare,
      connected: false,
      description: "Get notifications in your Slack workspace",
    },
    {
      name: "Google Calendar",
      icon: CalendarIcon,
      connected: false,
      description: "Sync meeting deadlines to your calendar",
    },
    {
      name: "Zoom",
      icon: Video,
      connected: false,
      description: "Automatically import Zoom meeting recordings",
    },
  ])

  // Billing info
  const [subscription, setSubscription] = useState<any>(null)

  useEffect(() => {
    if (user) {
      setName(user.fullName || "")
      setEmail(user.emailAddresses[0]?.emailAddress || "")
    }
    fetchSubscription()
  }, [user])

  const fetchSubscription = async () => {
    try {
      const res = await fetch("/api/subscription")
      const data = await res.json()
      setSubscription(data.subscription)
    } catch (error) {
      console.error("Failed to fetch subscription:", error)
    }
  }

  const handleSaveProfile = async () => {
    setLoading(true)
    try {
      // Update user profile via Clerk
      await user?.update({
        firstName: name.split(" ")[0],
        lastName: name.split(" ").slice(1).join(" "),
      })
      showSavedMessage()
    } catch (error) {
      console.error("Failed to update profile:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveNotifications = async () => {
    setLoading(true)
    try {
      await fetch("/api/settings/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(notifications),
      })
      showSavedMessage()
    } catch (error) {
      console.error("Failed to save notifications:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleConnectIntegration = async (integrationName: string) => {
    // Simulate OAuth flow
    alert(`Connecting to ${integrationName}... (OAuth flow would happen here)`)
  }

  const handleDisconnectIntegration = async (integrationName: string) => {
    if (!confirm(`Disconnect ${integrationName}?`)) return
    
    setIntegrations(prev =>
      prev.map(int =>
        int.name === integrationName ? { ...int, connected: false } : int
      )
    )
  }

  const handleManageBilling = async () => {
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      console.error("Failed to open billing portal:", error)
    }
  }

  const handleUpgrade = async () => {
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          priceId:
            process.env.NEXT_PUBLIC_STRIPE_PRICE_ID ||
            "price_1TSveBRuoH55oHIo89qWZ8js",
        }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      console.error("Failed to start checkout:", error)
    }
  }

  const showSavedMessage = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const tabs = [
    { id: "profile" as TabType, label: "Profile", icon: User },
    { id: "notifications" as TabType, label: "Notifications", icon: Bell },
    { id: "integrations" as TabType, label: "Integrations", icon: LinkIcon },
    { id: "billing" as TabType, label: "Billing", icon: CreditCard },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold gradient-text mb-2">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>

        {/* Tabs */}
        <div className="glass-card p-2">
          <div className="flex gap-2 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? "bg-gradient-to-r from-purple-600/20 to-pink-600/20 text-foreground border border-purple-500/30"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="glass-card p-6">
          {/* Profile Tab */}
          {activeTab === "profile" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold mb-4">Profile Information</h2>
                <div className="space-y-4 max-w-xl">
                  <div>
                    <label className="block text-sm font-medium mb-2">Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500/50 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Email</label>
                    <input
                      type="email"
                      value={email}
                      disabled
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg opacity-50 cursor-not-allowed"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Email cannot be changed
                    </p>
                  </div>

                  <button
                    onClick={handleSaveProfile}
                    disabled={loading}
                    className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-semibold hover:shadow-lg transition-shadow disabled:opacity-50 flex items-center gap-2"
                  >
                    {saved ? (
                      <>
                        <Check className="w-4 h-4" />
                        Saved!
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
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === "notifications" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold mb-4">Notification Preferences</h2>
                <div className="space-y-6 max-w-xl">
                  {/* Weekly Digest */}
                  <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold mb-1">Weekly Accountability Digest</h3>
                        <p className="text-sm text-muted-foreground">
                          Get a weekly summary of your tasks and progress
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notifications.weeklyDigest}
                          onChange={(e) =>
                            setNotifications({
                              ...notifications,
                              weeklyDigest: e.target.checked,
                            })
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                      </label>
                    </div>
                    {notifications.weeklyDigest && (
                      <div className="grid grid-cols-2 gap-3 mt-3">
                        <div>
                          <label className="block text-xs font-medium mb-1">Day</label>
                          <select
                            value={notifications.digestDay}
                            onChange={(e) =>
                              setNotifications({
                                ...notifications,
                                digestDay: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-purple-500/50"
                          >
                            <option value="monday">Monday</option>
                            <option value="tuesday">Tuesday</option>
                            <option value="wednesday">Wednesday</option>
                            <option value="thursday">Thursday</option>
                            <option value="friday">Friday</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium mb-1">Time</label>
                          <input
                            type="time"
                            value={notifications.digestTime}
                            onChange={(e) =>
                              setNotifications({
                                ...notifications,
                                digestTime: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-purple-500/50"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Overdue Reminders */}
                  <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold mb-1">Task Overdue Reminders</h3>
                        <p className="text-sm text-muted-foreground">
                          Get notified about overdue tasks
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notifications.overdueReminders}
                          onChange={(e) =>
                            setNotifications({
                              ...notifications,
                              overdueReminders: e.target.checked,
                            })
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                      </label>
                    </div>
                    {notifications.overdueReminders && (
                      <div>
                        <label className="block text-xs font-medium mb-1">Frequency</label>
                        <select
                          value={notifications.reminderFrequency}
                          onChange={(e) =>
                            setNotifications({
                              ...notifications,
                              reminderFrequency: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-purple-500/50"
                        >
                          <option value="daily">Daily</option>
                          <option value="weekly">Weekly</option>
                        </select>
                      </div>
                    )}
                  </div>

                  {/* Task Assigned */}
                  <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold mb-1">New Task Assigned to Me</h3>
                        <p className="text-sm text-muted-foreground">
                          Get notified when a task is assigned to you
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notifications.taskAssigned}
                          onChange={(e) =>
                            setNotifications({
                              ...notifications,
                              taskAssigned: e.target.checked,
                            })
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                      </label>
                    </div>
                  </div>

                  <button
                    onClick={handleSaveNotifications}
                    disabled={loading}
                    className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-semibold hover:shadow-lg transition-shadow disabled:opacity-50 flex items-center gap-2"
                  >
                    {saved ? (
                      <>
                        <Check className="w-4 h-4" />
                        Saved!
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Save Preferences
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Integrations Tab */}
          {activeTab === "integrations" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold mb-4">Connected Integrations</h2>
                <div className="space-y-4 max-w-2xl">
                  {integrations.map((integration) => {
                    const Icon = integration.icon
                    return (
                      <div
                        key={integration.name}
                        className="p-4 rounded-lg bg-white/5 border border-white/10 flex items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-4">
                          <div className="p-3 rounded-lg bg-white/10">
                            <Icon className="w-6 h-6" />
                          </div>
                          <div>
                            <h3 className="font-semibold mb-1">{integration.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {integration.description}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {integration.connected ? (
                            <>
                              <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-400">
                                Connected
                              </span>
                              <button
                                onClick={() => handleDisconnectIntegration(integration.name)}
                                className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors font-medium text-sm"
                              >
                                Disconnect
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => handleConnectIntegration(integration.name)}
                              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-semibold hover:shadow-lg transition-shadow text-sm"
                            >
                              Connect
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Billing Tab */}
          {activeTab === "billing" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold mb-4">Billing & Subscription</h2>
                <div className="space-y-6 max-w-2xl">
                  {/* Current Plan */}
                  <div className="p-6 rounded-lg bg-gradient-to-br from-purple-600/10 to-pink-600/10 border border-purple-500/30">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold mb-1">Current Plan</h3>
                        <p className="text-2xl font-bold gradient-text">
                          {subscription?.plan === "pro" ? "Pro Plan" : "Free Plan"}
                        </p>
                      </div>
                      {subscription?.plan === "pro" && (
                        <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-sm font-medium">
                          Active
                        </span>
                      )}
                    </div>

                    {subscription?.plan === "pro" ? (
                      <div className="space-y-2 text-sm text-muted-foreground mb-4">
                        <p>
                          Next billing date:{" "}
                          {subscription.current_period_end
                            ? new Date(subscription.current_period_end).toLocaleDateString()
                            : "N/A"}
                        </p>
                        <p>Unlimited meetings per month</p>
                        <p>Priority support included</p>
                      </div>
                    ) : (
                      <div className="space-y-2 text-sm text-muted-foreground mb-4">
                        <p>5 meetings per month</p>
                        <p>Basic features included</p>
                      </div>
                    )}

                    {subscription?.plan === "pro" ? (
                      <button
                        onClick={handleManageBilling}
                        className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-lg font-medium transition-colors flex items-center gap-2"
                      >
                        Manage Subscription
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        onClick={handleUpgrade}
                        className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-semibold hover:shadow-lg transition-shadow"
                      >
                        Upgrade to Pro
                      </button>
                    )}
                  </div>

                  {/* Usage This Month */}
                  <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                    <h3 className="font-semibold mb-3">Usage This Month</h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Meetings processed</span>
                        <span className="font-medium">
                          {subscription?.plan === "pro" ? "Unlimited" : "N / 5"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Billing Portal */}
                  {subscription?.plan === "pro" && (
                    <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                      <h3 className="font-semibold mb-2">Billing Portal</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Manage your subscription, update payment methods, and view invoice history
                      </p>
                      <button
                        onClick={handleManageBilling}
                        className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg font-medium transition-colors flex items-center gap-2"
                      >
                        Open Billing Portal
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
