'use client'

import { useState } from 'react'
import MaterialCard from '@/components/material-card'
import WeekEditForm from '@/components/week-edit-form'
import { submitDeliverable } from '@/lib/actions/week-content'
import type { MaterialWithScores, WeekContent, Deliverable } from '@/lib/supabase/types'

type Tab = 'resources' | 'objectives' | 'deliverable'

interface WeeklyTabsProps {
  currentWeek: string
  materials: MaterialWithScores[]
  weekContent: WeekContent | null
  userDeliverable: Deliverable | null
  allDeliverables: (Deliverable & { profiles?: { full_name: string | null; email: string } })[]
  isAdmin: boolean
  userReviewedIds: Set<string>
  coreMats: MaterialWithScores[]
  optionalMats: MaterialWithScores[]
  hasDeliverable: boolean
}

export default function WeeklyTabs({
  currentWeek,
  materials,
  weekContent,
  userDeliverable,
  allDeliverables,
  isAdmin,
  userReviewedIds,
  coreMats,
  optionalMats,
  hasDeliverable,
}: WeeklyTabsProps) {
  const [activeTab, setActiveTab] = useState<Tab>('resources')
  const [showEditForm, setShowEditForm] = useState(false)
  const [deliverableText, setDeliverableText] = useState(userDeliverable?.content || '')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  const coreTotal = coreMats.length
  const coreReviewed = coreMats.filter(m => userReviewedIds.has(m.id)).length
  const corePct = coreTotal > 0 ? Math.round((coreReviewed / coreTotal) * 100) : 0
  const weekComplete = corePct === 100

  async function handleSubmitDeliverable() {
    if (!deliverableText.trim()) return
    setSubmitting(true)
    setSubmitError(null)
    const result = await submitDeliverable(currentWeek, deliverableText.trim())
    setSubmitting(false)
    if (result?.error) {
      setSubmitError(result.error)
    } else {
      setSubmitSuccess(true)
      setTimeout(() => setSubmitSuccess(false), 3000)
    }
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: 'resources', label: `Resources (${materials.length})` },
    { id: 'objectives', label: 'Objectives' },
    ...(hasDeliverable ? [{ id: 'deliverable' as Tab, label: 'Deliverable' }] : []),
  ]

  return (
    <div>
      {/* Sub-tab bar */}
      <div className="flex gap-1 border-b border-border mb-6">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === tab.id
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Resources Tab */}
      {activeTab === 'resources' && (
        <div>
          {/* Progress bar for core materials */}
          {coreTotal > 0 && (
            <div className="mb-6 bg-card rounded-xl border border-border p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Core Progress
                </span>
                <span className={`text-sm font-semibold ${weekComplete ? 'text-green-600' : 'text-primary'}`}>
                  {coreReviewed}/{coreTotal} reviewed ({corePct}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${weekComplete ? 'bg-green-500' : 'bg-primary'}`}
                  style={{ width: `${corePct}%` }}
                />
              </div>
              {weekComplete && (
                <p className="text-xs text-green-600 font-medium mt-2">
                  All core materials reviewed!
                </p>
              )}
            </div>
          )}

          {materials.length === 0 ? (
            <div className="bg-card rounded-xl border border-border p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-muted">No materials for {currentWeek} yet.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Core materials */}
              {coreMats.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-gradient-to-r from-amber-400 to-orange-400 text-white">
                      💎 Core
                    </span>
                    <span className="text-xs text-muted">{coreMats.length} materials</span>
                  </div>
                  <div className="space-y-3">
                    {coreMats.map((material, idx) => (
                      <div key={material.id} className="relative">
                        <div className="absolute -left-3 top-5 w-7 h-7 bg-gradient-to-br from-amber-400 to-orange-400 rounded-full flex items-center justify-center text-white text-xs font-bold z-10 shadow-md">
                          #{idx + 1}
                        </div>
                        <MaterialCard material={material} from="weekly" week={currentWeek} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Optional materials */}
              {optionalMats.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                      Optional
                    </span>
                    <span className="text-xs text-muted">{optionalMats.length} materials</span>
                  </div>
                  <div className="space-y-3">
                    {optionalMats.map((material, idx) => (
                      <div key={material.id} className="relative">
                        <div className="absolute -left-3 top-5 w-7 h-7 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold z-10 shadow-md">
                          #{idx + 1}
                        </div>
                        <MaterialCard material={material} from="weekly" week={currentWeek} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Objectives Tab */}
      {activeTab === 'objectives' && (
        <div className="space-y-6">
          {showEditForm && isAdmin ? (
            <WeekEditForm
              week={currentWeek}
              initialTitle={weekContent?.title}
              initialDescription={weekContent?.description}
              initialObjectives={weekContent?.objectives}
              initialHomework={weekContent?.homework}
              initialDeliverablePrompt={weekContent?.deliverable_prompt}
              onClose={() => setShowEditForm(false)}
            />
          ) : (
            <>
              {/* Objectives */}
              <div className="bg-card rounded-xl border border-border p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">Learning Objectives</h3>
                  {isAdmin && (
                    <button
                      onClick={() => setShowEditForm(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 border border-border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit
                    </button>
                  )}
                </div>
                {weekContent?.objectives && weekContent.objectives.length > 0 ? (
                  <ul className="space-y-2">
                    {weekContent.objectives.map((obj, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                          {i + 1}
                        </div>
                        <span className="text-sm text-gray-700">{obj}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted">
                    {isAdmin
                      ? 'No objectives set yet. Click Edit to add objectives.'
                      : 'No objectives have been set for this week yet.'}
                  </p>
                )}
              </div>

              {/* Homework */}
              {weekContent?.homework && (
                <div className="bg-card rounded-xl border border-border p-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Homework & Notes</h3>
                  <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {weekContent.homework}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Deliverable Tab */}
      {activeTab === 'deliverable' && (
        <div className="space-y-6">
          {/* Deliverable prompt */}
          {weekContent?.deliverable_prompt && (
            <div className="bg-blue-50 rounded-xl border border-blue-200 p-6">
              <h3 className="font-semibold text-blue-900 mb-2">What to Submit</h3>
              <p className="text-sm text-blue-800 leading-relaxed whitespace-pre-wrap">
                {weekContent.deliverable_prompt}
              </p>
            </div>
          )}

          {/* User submission form */}
          <div className="bg-card rounded-xl border border-border p-6">
            <h3 className="font-semibold text-gray-900 mb-4">
              {userDeliverable ? 'Update Your Submission' : 'Your Submission'}
            </h3>

            {submitError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {submitError}
              </div>
            )}
            {submitSuccess && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                Submission saved!
              </div>
            )}

            <textarea
              value={deliverableText}
              onChange={e => setDeliverableText(e.target.value)}
              placeholder="Write your submission here..."
              rows={8}
              className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-y mb-4"
            />
            <button
              onClick={handleSubmitDeliverable}
              disabled={submitting || !deliverableText.trim()}
              className="px-6 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Saving...' : userDeliverable ? 'Update Submission' : 'Submit'}
            </button>
          </div>

          {/* Admin: all submissions */}
          {isAdmin && allDeliverables.length > 0 && (
            <div className="bg-card rounded-xl border border-border p-6">
              <h3 className="font-semibold text-gray-900 mb-4">
                All Submissions ({allDeliverables.length})
              </h3>
              <div className="space-y-4">
                {allDeliverables.map(d => {
                  const name = d.profiles?.full_name || d.profiles?.email || 'Anonymous'
                  return (
                    <div key={d.id} className="border border-border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">{name}</span>
                        <span className="text-xs text-muted">
                          {new Date(d.updated_at).toLocaleDateString('en-US', {
                            month: 'short', day: 'numeric', year: 'numeric'
                          })}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 whitespace-pre-wrap">{d.content}</p>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
