'use client'

import { useState } from 'react'
import { updateWeekContent } from '@/lib/actions/week-content'

interface WeekEditFormProps {
  week: string
  initialTitle?: string | null
  initialDescription?: string | null
  initialObjectives?: string[] | null
  initialHomework?: string | null
  initialDeliverablePrompt?: string | null
  onClose: () => void
}

export default function WeekEditForm({
  week,
  initialTitle,
  initialDescription,
  initialObjectives,
  initialHomework,
  initialDeliverablePrompt,
  onClose,
}: WeekEditFormProps) {
  const [title, setTitle] = useState(initialTitle || '')
  const [description, setDescription] = useState(initialDescription || '')
  const [objectivesText, setObjectivesText] = useState(
    (initialObjectives || []).join('\n')
  )
  const [homework, setHomework] = useState(initialHomework || '')
  const [deliverablePrompt, setDeliverablePrompt] = useState(
    initialDeliverablePrompt || ''
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleSave() {
    setLoading(true)
    setError(null)
    setSuccess(false)

    const objectives = objectivesText
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean)

    const result = await updateWeekContent(week, {
      title: title.trim() || undefined,
      description: description.trim() || undefined,
      objectives: objectives.length > 0 ? objectives : undefined,
      homework: homework.trim() || undefined,
      deliverable_prompt: deliverablePrompt.trim() || undefined,
    })

    setLoading(false)

    if (result?.error) {
      setError(result.error)
    } else {
      setSuccess(true)
      setTimeout(() => onClose(), 800)
    }
  }

  return (
    <div className="bg-card rounded-xl border border-border p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Edit {week}</h3>
        <button
          onClick={onClose}
          className="text-muted hover:text-gray-700 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
          Saved!
        </div>
      )}

      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Week Title
        </label>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder={week}
          className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description / Subtitle
        </label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="e.g. AI Foundations & Strategic Thinking"
          rows={2}
          className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
        />
      </div>

      {/* Objectives */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Objectives <span className="text-muted font-normal">(one per line)</span>
        </label>
        <textarea
          value={objectivesText}
          onChange={e => setObjectivesText(e.target.value)}
          placeholder="Understand core AI concepts&#10;Apply prompt engineering techniques&#10;..."
          rows={5}
          className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-y font-mono"
        />
      </div>

      {/* Homework */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Homework / Notes <span className="text-muted font-normal">(markdown supported)</span>
        </label>
        <textarea
          value={homework}
          onChange={e => setHomework(e.target.value)}
          placeholder="This week, focus on..."
          rows={4}
          className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-y"
        />
      </div>

      {/* Deliverable Prompt */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Deliverable Prompt
        </label>
        <textarea
          value={deliverablePrompt}
          onChange={e => setDeliverablePrompt(e.target.value)}
          placeholder="Describe what participants should submit this week..."
          rows={3}
          className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-y"
        />
      </div>

      <div className="flex gap-3 pt-1">
        <button
          onClick={handleSave}
          disabled={loading}
          className="flex-1 py-2.5 bg-primary text-white rounded-lg font-medium text-sm hover:bg-primary-dark transition-colors disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
        <button
          onClick={onClose}
          className="px-4 py-2.5 border border-border rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
