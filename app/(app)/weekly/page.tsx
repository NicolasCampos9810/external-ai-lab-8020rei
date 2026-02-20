import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { WEEKS, WEEK_DESCRIPTIONS } from '@/lib/supabase/types'
import WeeklyTabs from '@/components/weekly-tabs'

interface Props {
  searchParams: Promise<{ week?: string }>
}

export default async function WeeklyTrainingPage({ searchParams }: Props) {
  const params = await searchParams
  const currentWeek = params.week || 'Week 1'
  const supabase = await createClient()

  // Round 1: auth (required by all downstream queries)
  const { data: { user } } = await supabase.auth.getUser()

  // Round 2: profile + user vote IDs (parallel, both depend only on user)
  const [profileResult, userVotesResult] = await Promise.all([
    supabase.from('profiles').select('role').eq('id', user!.id).single(),
    supabase.from('votes').select('material_id').eq('user_id', user!.id),
  ])

  const isAdmin = profileResult.data?.role === 'admin'
  const userReviewedIds = new Set(
    (userVotesResult.data || []).map(v => v.material_id)
  )

  // Round 3: all independent data for the selected week (parallel)
  // Replaces ~15 sequential queries with 4 parallel ones
  const [
    materialsResult,
    weekContentResult,
    userDeliverableResult,
    allMaterialWeeksResult,
  ] = await Promise.all([
    supabase
      .from('material_scores')
      .select('*')
      .eq('week', currentWeek)
      .order('is_essential', { ascending: false })
      .order('avg_relevance', { ascending: false, nullsFirst: false })
      .order('avg_overall', { ascending: false, nullsFirst: false })
      .limit(100),
    supabase
      .from('week_content')
      .select('*')
      .eq('week', currentWeek)
      .single(),
    supabase
      .from('deliverables')
      .select('*')
      .eq('user_id', user!.id)
      .eq('week', currentWeek)
      .single(),
    // One query to count per week — replaces 10 sequential COUNT queries
    supabase
      .from('materials')
      .select('week')
      .not('week', 'is', null),
  ])

  const materials = materialsResult.data || []
  const weekContent = weekContentResult.data || null
  const userDeliverable = userDeliverableResult.data || null

  // Count per week in JS (1 query instead of N)
  const weekCounts: Record<string, number> = {}
  WEEKS.forEach(w => { weekCounts[w] = 0 })
  allMaterialWeeksResult.data?.forEach(m => {
    if (m.week && weekCounts[m.week] !== undefined) weekCounts[m.week]++
  })

  // Round 4: admin-only data (depends on isAdmin from Round 2)
  let allDeliverables: {
    id: string; user_id: string; week: string; content: string
    created_at: string; updated_at: string
    profiles?: { full_name: string | null; email: string }
  }[] = []
  if (isAdmin) {
    const { data } = await supabase
      .from('deliverables')
      .select('*, profiles(full_name, email)')
      .eq('week', currentWeek)
      .order('created_at', { ascending: false })
    allDeliverables = (data || []) as typeof allDeliverables
  }

  // Tier split for Resources tab
  const coreMats = materials.filter(m => m.is_essential)
  const optionalMats = materials.filter(m => !m.is_essential)
  const hasDeliverable = !!(weekContent?.deliverable_prompt)

  // Week header — prefer DB values, fall back to hardcoded constants
  const weekTitle = weekContent?.title || currentWeek
  const weekDescription = weekContent?.description || WEEK_DESCRIPTIONS[currentWeek] || ''

  return (
    <div className="max-w-6xl">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Weekly Training</h1>
        <p className="text-muted mt-1">Materials and objectives organized by training week</p>
      </div>

      {/* Week selector — URL-based (triggers server re-render to load new week data) */}
      <div className="bg-card rounded-xl border border-border p-2 mb-6 overflow-x-auto">
        <div className="flex gap-1.5 min-w-max">
          {WEEKS.map(week => {
            const isActive = week === currentWeek
            const count = weekCounts[week] || 0
            return (
              <Link
                key={week}
                href={`/weekly?week=${encodeURIComponent(week)}`}
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-primary text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {week}
                <span className={`ml-1.5 text-xs ${isActive ? 'text-white/70' : 'text-muted'}`}>
                  ({count})
                </span>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Week header card — title + description from DB, with WEEK_DESCRIPTIONS fallback */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200 p-6 mb-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{weekTitle}</h2>
            {weekDescription && (
              <p className="text-sm text-muted mt-1">{weekDescription}</p>
            )}
            <p className="text-xs text-muted mt-2">
              {materials.length > 0
                ? `${materials.length} ${materials.length === 1 ? 'material' : 'materials'} · ${coreMats.length} core, ${optionalMats.length} optional`
                : 'No materials yet'}
            </p>
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

      {/* Sub-tabs (Resources / Objectives / Deliverable) — client-side, no server roundtrip */}
      <WeeklyTabs
        currentWeek={currentWeek}
        materials={materials}
        weekContent={weekContent}
        userDeliverable={userDeliverable}
        allDeliverables={allDeliverables}
        isAdmin={isAdmin}
        userReviewedIds={userReviewedIds}
        coreMats={coreMats}
        optionalMats={optionalMats}
        hasDeliverable={hasDeliverable}
      />
    </div>
  )
}
