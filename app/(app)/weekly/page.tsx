import { createClient } from '@/lib/supabase/server'
import MaterialCard from '@/components/material-card'
import Link from 'next/link'
import { WEEKS, WEEK_DESCRIPTIONS } from '@/lib/supabase/types'

interface Props {
  searchParams: Promise<{
    week?: string
  }>
}

export default async function WeeklyTrainingPage({ searchParams }: Props) {
  const params = await searchParams
  const currentWeek = params.week || 'Week 1'
  const supabase = await createClient()

  // Get current user role + reviewed IDs
  const { data: { user } } = await supabase.auth.getUser()
  let isAdmin = false
  let userReviewedIds: string[] = []
  if (user) {
    const [{ data: profile }, { data: userVotes }] = await Promise.all([
      supabase.from('profiles').select('role').eq('id', user.id).single(),
      supabase.from('votes').select('material_id').eq('user_id', user.id),
    ])
    isAdmin = profile?.role === 'admin'
    userReviewedIds = (userVotes ?? []).map(v => v.material_id)
  }

  // Get materials for the selected week, sorted by relevance
  const { data: materials } = await supabase
    .from('material_scores')
    .select('*')
    .eq('week', currentWeek)
    .order('avg_relevance', { ascending: false, nullsFirst: false })
    .order('avg_overall', { ascending: false, nullsFirst: false })

  // Get counts for each week to show in tabs
  const weekCounts: Record<string, number> = {}
  for (const week of WEEKS) {
    const { count } = await supabase
      .from('materials')
      .select('*', { count: 'exact', head: true })
      .eq('week', week)
    weekCounts[week] = count || 0
  }

  return (
    <div className="max-w-6xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Weekly Training</h1>
        <p className="text-muted mt-1">Materials organized by training week, sorted by relevance</p>
      </div>

      {/* Info Box - How it works */}
      <div className="mb-6 bg-blue-50 rounded-xl border border-blue-200 p-5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-blue-200 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-blue-900">How it works</h3>
            <p className="text-sm text-blue-700 mt-1">
              Materials are organized by training week and sorted by <strong>relevance score</strong> - showing you the most applicable content first.
              The ranking helps you prioritize your learning for each week.
            </p>
          </div>
        </div>
      </div>

      {/* Week Tabs — horizontal scroll on mobile */}
      <div className="bg-card rounded-xl border border-border p-2 mb-6">
        <div className="overflow-x-auto">
          <div className="flex gap-2 flex-nowrap min-w-max">
            {WEEKS.map(week => {
              const isActive = week === currentWeek
              const count = weekCounts[week] || 0
              return (
                <Link
                  key={week}
                  href={`/weekly?week=${encodeURIComponent(week)}`}
                  className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-primary text-white shadow-md'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {week}
                  <span className={`ml-2 text-xs ${
                    isActive ? 'text-white/80' : 'text-muted'
                  }`}>
                    ({count})
                  </span>
                </Link>
              )
            })}
          </div>
        </div>
      </div>

      {/* Week Content */}
      {(() => {
        const total = materials?.length ?? 0
        const reviewed = materials?.filter(m => userReviewedIds.includes(m.id)).length ?? 0
        const pct = total > 0 ? Math.round((reviewed / total) * 100) : 0
        return (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200 p-5 md:p-6 mb-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-bold text-gray-900">{currentWeek}</h2>
                {WEEK_DESCRIPTIONS[currentWeek] && (
                  <p className="text-sm text-blue-700 font-medium mt-0.5">{WEEK_DESCRIPTIONS[currentWeek]}</p>
                )}
                <p className="text-xs text-muted mt-1">
                  {total > 0 ? `${total} ${total === 1 ? 'material' : 'materials'} • Sorted by relevance` : 'No materials for this week yet'}
                </p>
                {/* Progress bar */}
                {total > 0 && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-gray-700">Your progress</span>
                      <span className="text-xs font-semibold text-gray-900">{reviewed}/{total} reviewed</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${pct === 100 ? 'bg-green-500' : 'bg-primary'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    {pct === 100 && (
                      <p className="text-xs text-green-600 font-medium mt-1">✓ Week complete!</p>
                    )}
                  </div>
                )}
              </div>
              {isAdmin && (
                <Link
                  href="/upload"
                  className="flex-shrink-0 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors"
                >
                  Add Materials
                </Link>
              )}
            </div>
          </div>
        )
      })()}

      {/* Materials List */}
      {materials && materials.length > 0 ? (
        <div className="space-y-3">
          {materials.map((material, idx) => (
            <div key={material.id} className="relative">
              {/* Relevance ranking badge */}
              <div className="absolute -left-3 top-5 w-7 h-7 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold z-10 shadow-md">
                #{idx + 1}
              </div>
              <MaterialCard material={material} from="weekly" week={currentWeek} isReviewed={userReviewedIds.includes(material.id)} />
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-muted mb-4">No materials for {currentWeek} yet.</p>
          {isAdmin && (
            <Link
              href="/upload"
              className="inline-block px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors"
            >
              Upload Materials
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
