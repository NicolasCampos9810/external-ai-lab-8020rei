'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { deleteUser, updateUserRole, createMissingProfile } from '@/lib/actions/profiles'
import type { OrphanedUser } from '@/lib/actions/profiles'
import type { Profile, MaterialWithScores } from '@/lib/supabase/types'
import { WEEKS } from '@/lib/supabase/types'

interface ProgressRawData {
  materials: { id: string; week: string | null; material_tier: string | null; title?: string | null }[]
  votes: { user_id: string; material_id: string; comment: string | null }[]
  deliverables: { user_id: string; week: string }[]
}

interface ViewRecord {
  user_id: string
  material_id: string
  material_week: string | null
  source: string
  viewed_at: string
}

interface AdminPanelProps {
  users: Profile[]
  materials: MaterialWithScores[]
  orphanedUsers: OrphanedUser[]
  progressData: ProgressRawData
  engagementData: { views: ViewRecord[] }
}

export default function AdminPanel({ users, materials, orphanedUsers, progressData, engagementData }: AdminPanelProps) {
  const [tab, setTab] = useState<'users' | 'materials' | 'progress'>('users')

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 mb-6 w-fit">
        <button
          onClick={() => setTab('users')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            tab === 'users' ? 'bg-white shadow text-gray-900' : 'text-muted hover:text-gray-700'
          }`}
        >
          Users ({users.length})
          {orphanedUsers.length > 0 && (
            <span className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full bg-amber-500 text-white text-[10px] font-bold">
              {orphanedUsers.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setTab('materials')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            tab === 'materials' ? 'bg-white shadow text-gray-900' : 'text-muted hover:text-gray-700'
          }`}
        >
          Materials ({materials.length})
        </button>
        <button
          onClick={() => setTab('progress')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            tab === 'progress' ? 'bg-white shadow text-gray-900' : 'text-muted hover:text-gray-700'
          }`}
        >
          Progress
        </button>
      </div>

      {tab === 'users' ? (
        <UsersTable users={users} orphanedUsers={orphanedUsers} />
      ) : tab === 'materials' ? (
        <MaterialsTable materials={materials} />
      ) : (
        <UnifiedProgressView users={users} progressData={progressData} views={engagementData.views} />
      )}
    </div>
  )
}

function UsersTable({ users, orphanedUsers }: { users: Profile[]; orphanedUsers: OrphanedUser[] }) {
  const router = useRouter()
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; email: string } | null>(null)
  const [deleteInput, setDeleteInput] = useState('')

  async function toggleRole(userId: string, currentRole: string) {
    const newRole = currentRole === 'admin' ? 'user' : 'admin'
    setLoadingId(userId + '-role')
    setError(null)
    const result = await updateUserRole(userId, newRole)
    setLoadingId(null)
    if (result.error) {
      setError(result.error)
    } else {
      router.refresh()
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return
    setLoadingId(deleteTarget.id + '-delete')
    setError(null)
    const result = await deleteUser(deleteTarget.id)
    setLoadingId(null)
    setDeleteTarget(null)
    setDeleteInput('')
    if (result.error) {
      setError(result.error)
    } else {
      router.refresh()
    }
  }

  async function handleCreateProfile(u: OrphanedUser) {
    setLoadingId(u.id + '-fix')
    setError(null)
    const result = await createMissingProfile(u.id, u.email, u.full_name)
    setLoadingId(null)
    if (result.error) {
      setError(result.error)
    } else {
      router.refresh()
    }
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl border border-border w-full max-w-md mx-4 p-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="flex-shrink-0 w-9 h-9 rounded-full bg-red-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900">Delete user</h3>
                <p className="text-sm text-muted mt-0.5">
                  This will permanently remove <span className="font-medium text-gray-800">{deleteTarget.email}</span> and all their data. This cannot be undone.
                </p>
              </div>
            </div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              Type <span className="font-mono bg-gray-100 px-1 py-0.5 rounded text-gray-900">{deleteTarget.email}</span> to confirm
            </label>
            <input
              type="text"
              value={deleteInput}
              onChange={e => setDeleteInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && deleteInput === deleteTarget.email) confirmDelete() }}
              placeholder={deleteTarget.email}
              autoFocus
              className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-300 mb-4"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => { setDeleteTarget(null); setDeleteInput('') }}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 border border-border rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleteInput !== deleteTarget.email || !!loadingId}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {loadingId ? 'Deleting...' : 'Delete permanently'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Orphaned users — registered in auth but missing a profile */}
      {orphanedUsers.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 overflow-hidden">
          <div className="px-5 py-3 border-b border-amber-200 flex items-center gap-2">
            <svg className="w-4 h-4 text-amber-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
            <span className="text-sm font-semibold text-amber-800">
              {orphanedUsers.length} registered {orphanedUsers.length === 1 ? 'user' : 'users'} without a profile
            </span>
            <span className="text-xs text-amber-600">— these users signed up but don&apos;t appear in the dashboard</span>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-amber-200">
                <th className="text-left px-5 py-2.5 text-xs font-medium text-amber-700 uppercase tracking-wider">Email</th>
                <th className="text-left px-5 py-2.5 text-xs font-medium text-amber-700 uppercase tracking-wider">Name</th>
                <th className="text-left px-5 py-2.5 text-xs font-medium text-amber-700 uppercase tracking-wider">Registered</th>
                <th className="text-right px-5 py-2.5 text-xs font-medium text-amber-700 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-100">
              {orphanedUsers.map(u => (
                <tr key={u.id} className="hover:bg-amber-100/40">
                  <td className="px-5 py-3 text-sm text-gray-800">{u.email}</td>
                  <td className="px-5 py-3 text-sm text-muted">{u.full_name || '—'}</td>
                  <td className="px-5 py-3 text-sm text-muted">{new Date(u.created_at).toLocaleDateString()}</td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleCreateProfile(u)}
                        disabled={!!loadingId}
                        className="text-xs text-amber-700 hover:text-amber-900 font-medium disabled:opacity-50 border border-amber-300 hover:border-amber-500 px-2.5 py-1 rounded-md transition-colors"
                      >
                        {loadingId === u.id + '-fix' ? 'Creating...' : 'Create profile'}
                      </button>
                      <button
                        onClick={() => { setDeleteTarget({ id: u.id, email: u.email }); setDeleteInput('') }}
                        disabled={!!loadingId}
                        className="text-xs text-red-600 hover:text-red-800 font-medium disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-border">
              <th className="text-left px-5 py-3 text-xs font-medium text-muted uppercase tracking-wider">User</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-muted uppercase tracking-wider">Email</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-muted uppercase tracking-wider">Role</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-muted uppercase tracking-wider">Joined</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-muted uppercase tracking-wider">Last Login</th>
              <th className="text-right px-5 py-3 text-xs font-medium text-muted uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users.map(user => (
              <tr key={user.id} className="hover:bg-gray-50/50">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-medium">
                      {(user.full_name || user.email).charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {user.full_name || '—'}
                    </span>
                  </div>
                </td>
                <td className="px-5 py-3 text-sm text-muted">{user.email}</td>
                <td className="px-5 py-3">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                    user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-5 py-3 text-sm text-muted">
                  {new Date(user.created_at).toLocaleDateString()}
                </td>
                <td className="px-5 py-3 text-sm text-muted">
                  {user.last_login
                    ? new Date(user.last_login).toLocaleDateString() + ' ' + new Date(user.last_login).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : '—'}
                </td>
                <td className="px-5 py-3 text-right">
                  <div className="flex items-center justify-end gap-3">
                    <button
                      onClick={() => toggleRole(user.id, user.role)}
                      disabled={loadingId === user.id + '-role'}
                      className="text-xs text-primary hover:text-primary-dark font-medium disabled:opacity-50"
                    >
                      {loadingId === user.id + '-role' ? 'Saving...' : `Make ${user.role === 'admin' ? 'User' : 'Admin'}`}
                    </button>
                    <button
                      onClick={() => { setDeleteTarget({ id: user.id, email: user.email }); setDeleteInput('') }}
                      disabled={!!loadingId}
                      className="text-xs text-red-600 hover:text-red-700 font-medium disabled:opacity-50"
                    >
                      {loadingId === user.id + '-delete' ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function MaterialsTable({ materials }: { materials: MaterialWithScores[] }) {
  const router = useRouter()

  async function handleDelete(materialId: string) {
    if (!confirm('Are you sure you want to delete this material?')) return
    const supabase = createClient()
    await supabase.from('materials').delete().eq('id', materialId)
    router.refresh()
  }

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="bg-gray-50 border-b border-border">
            <th className="text-left px-5 py-3 text-xs font-medium text-muted uppercase tracking-wider">Title</th>
            <th className="text-left px-5 py-3 text-xs font-medium text-muted uppercase tracking-wider">Categories</th>
            <th className="text-left px-5 py-3 text-xs font-medium text-muted uppercase tracking-wider">Score</th>
            <th className="text-left px-5 py-3 text-xs font-medium text-muted uppercase tracking-wider">Votes</th>
            <th className="text-left px-5 py-3 text-xs font-medium text-muted uppercase tracking-wider">Uploaded</th>
            <th className="text-right px-5 py-3 text-xs font-medium text-muted uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {materials.map(mat => (
            <tr key={mat.id} className="hover:bg-gray-50/50">
              <td className="px-5 py-3">
                <span className="text-sm font-medium text-gray-900">{mat.title}</span>
              </td>
              <td className="px-5 py-3">
                <div className="flex flex-wrap gap-1">
                  {(mat.categories || []).slice(0, 2).map(cat => (
                    <span key={cat} className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                      {cat}
                    </span>
                  ))}
                  {(mat.categories || []).length > 2 && (
                    <span className="text-xs text-muted">+{mat.categories.length - 2}</span>
                  )}
                </div>
              </td>
              <td className="px-5 py-3 text-sm text-muted">
                {mat.vote_count > 0 ? mat.avg_overall.toFixed(1) : '—'}
              </td>
              <td className="px-5 py-3 text-sm text-muted">{mat.vote_count}</td>
              <td className="px-5 py-3 text-sm text-muted">
                {new Date(mat.created_at).toLocaleDateString()}
              </td>
              <td className="px-5 py-3 text-right">
                <button
                  onClick={() => handleDelete(mat.id)}
                  className="text-xs text-red-600 hover:text-red-700 font-medium"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {materials.length === 0 && (
        <div className="p-8 text-center text-muted text-sm">No materials yet.</div>
      )}
    </div>
  )
}

// ─── Unified Progress View ────────────────────────────────────────────────────

function normalizeTier(tier: string | null | undefined): string {
  if (!tier) return ''
  return tier.toLowerCase().replace(/[\s_-]+/g, '')
}

interface WeekIndicators {
  opened: boolean
  commented: boolean
  scored: boolean
  delivered: boolean
}

function UnifiedProgressView({
  users,
  progressData,
  views,
}: {
  users: Profile[]
  progressData: ProgressRawData
  views: ViewRecord[]
}) {
  const [expandedUser, setExpandedUser] = useState<string | null>(null)

  // Only track weeks that have required materials (Must Read / Core)
  const weekRequiredMaterials: Record<string, string[]> = {}
  for (const week of WEEKS) {
    const ids = progressData.materials
      .filter(m => {
        if (m.week !== week) return false
        const t = normalizeTier(m.material_tier)
        return t === 'mustread' || t === 'core'
      })
      .map(m => m.id)
    if (ids.length > 0) weekRequiredMaterials[week] = ids
  }
  const activeWeeks = Object.keys(weekRequiredMaterials)

  // Members only (no admins)
  const members = users.filter(u => u.role !== 'admin')

  // Pre-compute per-user indicators for each active week
  const userProgressMap: Record<string, Record<string, WeekIndicators>> = {}

  members.forEach(user => {
    const userVotes = progressData.votes.filter(v => v.user_id === user.id)
    const userScoredIds = new Set(userVotes.map(v => v.material_id))
    const userCommentedIds = new Set(
      userVotes.filter(v => v.comment && v.comment.trim() !== '').map(v => v.material_id)
    )
    const userDeliverableWeeks = new Set(
      progressData.deliverables.filter(d => d.user_id === user.id).map(d => d.week)
    )
    const userViewedIds = new Set(views.filter(v => v.user_id === user.id).map(v => v.material_id))

    const weekMap: Record<string, WeekIndicators> = {}
    for (const week of activeWeeks) {
      const required = weekRequiredMaterials[week]
      const opened = required.some(id => userViewedIds.has(id))
      const commented = required.some(id => userCommentedIds.has(id))
      const scored = required.some(id => userScoredIds.has(id))
      const delivered = userDeliverableWeeks.has(week)
      weekMap[week] = { opened, commented, scored, delivered }
    }
    userProgressMap[user.id] = weekMap
  })

  // Aggregate metrics
  const totalIndicators = members.length * activeWeeks.length * 4
  let totalChecked = 0
  const weekEngagement: Record<string, number> = {}
  for (const week of activeWeeks) weekEngagement[week] = 0
  let fullyComplete = 0

  members.forEach(user => {
    let allComplete = true
    for (const week of activeWeeks) {
      const ind = userProgressMap[user.id]?.[week]
      if (!ind) { allComplete = false; continue }
      const count = [ind.opened, ind.commented, ind.scored, ind.delivered].filter(Boolean).length
      totalChecked += count
      weekEngagement[week] += count
      if (count < 4) allComplete = false
    }
    if (allComplete && activeWeeks.length > 0) fullyComplete++
  })

  const overallPct = totalIndicators > 0 ? Math.round((totalChecked / totalIndicators) * 100) : 0
  const maxPerWeek = members.length * 4

  // Most active week
  let mostActiveWeek = activeWeeks[0] || ''
  let maxEngagement = 0
  for (const week of activeWeeks) {
    if (weekEngagement[week] > maxEngagement) {
      maxEngagement = weekEngagement[week]
      mostActiveWeek = week
    }
  }

  // Per-user overall progress
  function getUserOverall(userId: string) {
    let checked = 0
    for (const week of activeWeeks) {
      const ind = userProgressMap[userId]?.[week]
      if (ind) checked += [ind.opened, ind.commented, ind.scored, ind.delivered].filter(Boolean).length
    }
    const total = activeWeeks.length * 4
    return { checked, total, pct: total > 0 ? Math.round((checked / total) * 100) : 0 }
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl border border-border p-5">
          <p className="text-xs font-medium text-muted uppercase tracking-wider mb-1">Overall Progress</p>
          <p className="text-2xl font-bold text-gray-900">{overallPct}%</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-5">
          <p className="text-xs font-medium text-muted uppercase tracking-wider mb-1">Most Active Week</p>
          <p className="text-2xl font-bold text-gray-900">{maxEngagement > 0 ? mostActiveWeek : '—'}</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-5">
          <p className="text-xs font-medium text-muted uppercase tracking-wider mb-1">Fully Complete</p>
          <p className="text-2xl font-bold text-gray-900">{fullyComplete} <span className="text-sm font-normal text-muted">of {members.length}</span></p>
        </div>
        <div className="bg-card rounded-xl border border-border p-5">
          <p className="text-xs font-medium text-muted uppercase tracking-wider mb-1">Active Weeks</p>
          <p className="text-2xl font-bold text-gray-900">{activeWeeks.length}</p>
        </div>
      </div>

      {/* Week Engagement Chart */}
      <div className="bg-card rounded-xl border border-border p-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-1">Week Engagement</h3>
        <p className="text-xs text-muted mb-4">Indicators completed per week across all members (opened + commented + scored + delivered)</p>
        {activeWeeks.length === 0 ? (
          <p className="text-sm text-muted">No weeks with required materials yet.</p>
        ) : (
          <div className="space-y-2.5">
            {activeWeeks.map(week => {
              const eng = weekEngagement[week]
              const pct = maxPerWeek > 0 ? (eng / maxPerWeek) * 100 : 0
              const isTop = week === mostActiveWeek && maxEngagement > 0
              return (
                <div key={week} className="flex items-center gap-3">
                  <span className={`w-16 text-xs font-medium ${isTop ? 'text-amber-600' : 'text-muted'}`}>{week}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-6 relative overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${isTop ? 'bg-amber-400' : 'bg-primary/70'}`}
                      style={{ width: `${Math.max(pct, 0)}%` }}
                    />
                    <span className={`absolute inset-0 flex items-center px-3 text-xs font-medium ${pct > 35 ? 'text-white' : 'text-gray-500'}`}>
                      {eng}/{maxPerWeek}{isTop ? ' — Most Active' : ''}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Individual Progress */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="text-sm font-semibold text-gray-900 mb-0.5">Individual Progress</h3>
          <p className="text-xs text-muted">Click a member to see their weekly breakdown</p>
        </div>

        {members.length === 0 && (
          <div className="p-8 text-center text-muted text-sm">No members yet.</div>
        )}

        <div className="divide-y divide-border">
          {members.map(user => {
            const overall = getUserOverall(user.id)
            const isExpanded = expandedUser === user.id

            return (
              <div key={user.id}>
                {/* Collapsed row */}
                <div
                  className="flex items-center gap-3 px-5 py-3 cursor-pointer hover:bg-gray-50/50 transition-colors"
                  onClick={() => setExpandedUser(isExpanded ? null : user.id)}
                >
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-medium flex-shrink-0">
                    {(user.full_name || user.email).charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{user.full_name || '—'}</p>
                    <p className="text-xs text-muted truncate">{user.email}</p>
                  </div>

                  {/* Mini week dots */}
                  <div className="hidden sm:flex items-center gap-1">
                    {activeWeeks.map(week => {
                      const ind = userProgressMap[user.id]?.[week]
                      const count = ind ? [ind.opened, ind.commented, ind.scored, ind.delivered].filter(Boolean).length : 0
                      const bg = count === 4
                        ? 'bg-green-500'
                        : count >= 2
                          ? 'bg-amber-400'
                          : count >= 1
                            ? 'bg-blue-400'
                            : 'bg-gray-200'
                      return (
                        <div
                          key={week}
                          className={`w-5 h-5 rounded ${bg} flex items-center justify-center`}
                          title={`${week}: ${count}/4`}
                        >
                          <span className="text-[9px] font-bold text-white">{count}</span>
                        </div>
                      )
                    })}
                  </div>

                  {/* Progress bar */}
                  <div className="flex items-center gap-2 w-28">
                    <div className="flex-1 bg-gray-100 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          overall.pct === 100 ? 'bg-green-500' : overall.pct > 0 ? 'bg-primary' : 'bg-gray-200'
                        }`}
                        style={{ width: `${overall.pct}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-gray-600 w-8 text-right">{overall.pct}%</span>
                  </div>

                  <svg
                    className={`w-4 h-4 text-muted flex-shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>

                {/* Expanded: per-week indicators */}
                {isExpanded && (
                  <div className="bg-gray-50 border-t border-border px-5 py-4">
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                      {activeWeeks.map(week => {
                        const ind = userProgressMap[user.id]?.[week] || { opened: false, commented: false, scored: false, delivered: false }
                        const count = [ind.opened, ind.commented, ind.scored, ind.delivered].filter(Boolean).length
                        const allDone = count === 4
                        return (
                          <div
                            key={week}
                            className={`rounded-lg border p-3 ${allDone ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-white'}`}
                          >
                            <div className="flex items-center justify-between mb-2.5">
                              <span className="text-xs font-semibold text-gray-800">{week}</span>
                              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                                allDone ? 'bg-green-100 text-green-700' : count > 0 ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-400'
                              }`}>{count}/4</span>
                            </div>
                            <div className="space-y-1.5">
                              <IndicatorRow label="Opened" active={ind.opened} activeColor="bg-blue-50 text-blue-700" />
                              <IndicatorRow label="Commented" active={ind.commented} activeColor="bg-amber-50 text-amber-700" />
                              <IndicatorRow label="Scored" active={ind.scored} activeColor="bg-purple-50 text-purple-700" />
                              <IndicatorRow label="Delivered" active={ind.delivered} activeColor="bg-green-50 text-green-700" />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function IndicatorRow({ label, active, activeColor }: { label: string; active: boolean; activeColor: string }) {
  return (
    <div className={`flex items-center gap-2 px-2 py-1 rounded text-xs ${active ? activeColor : 'bg-gray-50 text-gray-400'}`}>
      {active ? (
        <svg className="w-3 h-3 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      ) : (
        <span className="w-3 h-3 rounded-full border border-gray-300 flex-shrink-0" />
      )}
      <span>{label}</span>
    </div>
  )
}
