"use client"

import { useEffect, useState } from "react"
import DashboardLayout from "@/components/DashboardLayout"
import {
  Users,
  Mail,
  UserPlus,
  Trash2,
  Shield,
  CheckCircle2,
  Clock,
  X,
} from "lucide-react"

interface TeamMember {
  id: string
  name: string
  email: string
  avatar: string | null
  role: string
  tasksAssigned: number
  tasksCompleted: number
  joinedAt: string
}

interface PendingInvite {
  id: string
  email: string
  role: string
  invitedAt: string
}

export default function TeamPage() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [pendingInvites, setPendingInvites] = useState<PendingInvite[]>([])
  const [loading, setLoading] = useState(true)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRole, setInviteRole] = useState<"member" | "admin">("member")
  const [inviting, setInviting] = useState(false)

  useEffect(() => {
    fetchTeamData()
  }, [])

  const fetchTeamData = async () => {
    setLoading(true)
    try {
      // Fetch team members
      const membersRes = await fetch("/api/team/members")
      const membersData = await membersRes.json()
      setTeamMembers(membersData.members || [])

      // Fetch pending invites
      const invitesRes = await fetch("/api/team/invites")
      const invitesData = await invitesRes.json()
      setPendingInvites(invitesData.invites || [])
    } catch (error) {
    } finally {
      setLoading(false)
    }
  }

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inviteEmail) return

    setInviting(true)
    try {
      const res = await fetch("/api/team/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
      })

      if (res.ok) {
        setInviteEmail("")
        setInviteRole("member")
        setShowInviteModal(false)
        fetchTeamData()
      } else {
        const data = await res.json()
        alert(data.error || "Failed to send invite")
      }
    } catch (error) {
      alert("Failed to send invite")
    } finally {
      setInviting(false)
    }
  }

  const removeMember = async (memberId: string) => {
    if (!confirm("Are you sure you want to remove this team member?")) return

    try {
      await fetch(`/api/team/members?id=${memberId}`, { method: "DELETE" })
      fetchTeamData()
    } catch (error) {
    }
  }

  const cancelInvite = async (inviteId: string) => {
    try {
      await fetch(`/api/team/invites?id=${inviteId}`, { method: "DELETE" })
      fetchTeamData()
    } catch (error) {
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading team...</p>
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
            <h1 className="text-3xl font-bold gradient-text mb-2">Team Members</h1>
            <p className="text-muted-foreground">
              Manage your team and collaborate on meetings
            </p>
          </div>
          <button
            onClick={() => setShowInviteModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-semibold hover:shadow-lg transition-shadow flex items-center gap-2"
          >
            <UserPlus className="w-5 h-5" />
            Invite Member
          </button>
        </div>

        {/* Team Members List */}
        <div className="glass-card p-6">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-400" />
            Active Members ({teamMembers.length})
          </h2>

          {teamMembers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No team members yet</h3>
              <p className="text-muted-foreground mb-6">
                Invite team members to collaborate on meetings and tasks
              </p>
              <button
                onClick={() => setShowInviteModal(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-semibold hover:shadow-lg transition-shadow"
              >
                <UserPlus className="w-5 h-5" />
                Invite Your First Member
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {teamMembers.map((member) => {
                const completionRate =
                  member.tasksAssigned > 0
                    ? Math.round((member.tasksCompleted / member.tasksAssigned) * 100)
                    : 0

                return (
                  <div
                    key={member.id}
                    className="p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors border border-white/10"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4 flex-1">
                        {/* Avatar */}
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-lg font-semibold flex-shrink-0">
                          {member.name.charAt(0).toUpperCase()}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold">{member.name}</h3>
                            {member.role === "admin" && (
                              <span className="text-xs px-2 py-1 rounded-full bg-purple-500/20 text-purple-400 flex items-center gap-1">
                                <Shield className="w-3 h-3" />
                                Admin
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{member.email}</p>
                        </div>

                        {/* Stats */}
                        <div className="hidden md:flex items-center gap-6">
                          <div className="text-center">
                            <p className="text-2xl font-bold">{member.tasksAssigned}</p>
                            <p className="text-xs text-muted-foreground">Tasks assigned</p>
                          </div>
                          <div className="text-center">
                            <p className="text-2xl font-bold text-green-400">
                              {member.tasksCompleted}
                            </p>
                            <p className="text-xs text-muted-foreground">Completed</p>
                          </div>
                          <div className="text-center">
                            <p className="text-2xl font-bold text-purple-400">
                              {completionRate}%
                            </p>
                            <p className="text-xs text-muted-foreground">Completion</p>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      {member.role !== "admin" && (
                        <button
                          onClick={() => removeMember(member.id)}
                          className="p-2 hover:bg-red-500/20 rounded-lg transition-colors text-red-400"
                          title="Remove member"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {/* Mobile Stats */}
                    <div className="md:hidden mt-4 pt-4 border-t border-white/10">
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <p className="text-xl font-bold">{member.tasksAssigned}</p>
                          <p className="text-xs text-muted-foreground">Assigned</p>
                        </div>
                        <div>
                          <p className="text-xl font-bold text-green-400">
                            {member.tasksCompleted}
                          </p>
                          <p className="text-xs text-muted-foreground">Completed</p>
                        </div>
                        <div>
                          <p className="text-xl font-bold text-purple-400">
                            {completionRate}%
                          </p>
                          <p className="text-xs text-muted-foreground">Rate</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Pending Invites */}
        {pendingInvites.length > 0 && (
          <div className="glass-card p-6">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Clock className="w-5 h-5 text-yellow-400" />
              Pending Invites ({pendingInvites.length})
            </h2>

            <div className="space-y-3">
              {pendingInvites.map((invite) => (
                <div
                  key={invite.id}
                  className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-yellow-400" />
                    <div>
                      <p className="font-medium">{invite.email}</p>
                      <p className="text-sm text-muted-foreground">
                        Invited as {invite.role} •{" "}
                        {new Date(invite.invitedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => cancelInvite(invite.id)}
                    className="p-2 hover:bg-red-500/20 rounded-lg transition-colors text-red-400"
                    title="Cancel invite"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-black/90 border border-white/10 rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold gradient-text">Invite Team Member</h2>
              <button
                onClick={() => setShowInviteModal(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Email Address</label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="colleague@company.com"
                  required
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500/50 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Role</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as "member" | "admin")}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500/50 transition-colors"
                >
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                </select>
                <p className="text-xs text-muted-foreground mt-2">
                  {inviteRole === "admin"
                    ? "Admins can manage team members and settings"
                    : "Members can view and manage meetings and tasks"}
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={inviting}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-semibold hover:shadow-lg transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {inviting ? "Sending..." : "Send Invite"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
