"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { UserButton, useUser } from "@clerk/nextjs"
import {
  LayoutDashboard,
  Video,
  CheckSquare,
  Users,
  Settings,
  Menu,
  X,
  Sparkles,
  Zap,
} from "lucide-react"

interface DashboardLayoutProps {
  children: React.ReactNode
}

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Meetings", href: "/dashboard/meetings", icon: Video },
  { name: "Tasks", href: "/dashboard/tasks", icon: CheckSquare },
  { name: "Team", href: "/dashboard/team", icon: Users },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
]

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isPro, setIsPro] = useState(false)
  const pathname = usePathname()
  const { user } = useUser()

  useEffect(() => {
    fetchSubscriptionStatus()
  }, [])

  const fetchSubscriptionStatus = async () => {
    try {
      const res = await fetch("/api/usage")
      const data = await res.json()
      setIsPro(data.isPro || false)
    } catch (error) {
    }
  }

  const handleUpgrade = async () => {
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
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Fixed 240px width */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-60 bg-black/40 backdrop-blur-xl border-r border-white/10 transform transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <Link href="/" className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-purple-400" />
              <span className="text-lg font-bold gradient-text">MeetRix Action</span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? "bg-gradient-to-r from-purple-600/20 to-pink-600/20 text-foreground border border-purple-500/30"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              )
            })}
          </nav>

          {/* User section at bottom */}
          <div className="p-4 border-t border-white/10 space-y-3">
            {/* User info */}
            <div className="flex items-center gap-3 px-2">
              <UserButton afterSignOutUrl="/" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {user?.fullName || user?.emailAddresses[0]?.emailAddress}
                </p>
                <p className="text-xs text-muted-foreground">
                  {isPro ? "Pro Plan" : "Free Plan"}
                </p>
              </div>
            </div>

            {/* Upgrade button for free users */}
            {!isPro && (
              <button
                onClick={handleUpgrade}
                className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-semibold text-sm hover:shadow-lg transition-shadow flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4" />
                Upgrade to Pro
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-60">
        {/* Top bar */}
        <header className="sticky top-0 z-30 border-b border-white/10 bg-black/20 backdrop-blur-xl">
          <div className="flex items-center justify-between px-4 py-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-muted-foreground hover:text-foreground"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex-1 lg:flex-none" />
            <div className="lg:hidden">
              <UserButton afterSignOutUrl="/" />
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-8">{children}</main>
      </div>
    </div>
  )
}
