'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { uploadMaterials } from '@/lib/actions/materials'
import { CATEGORIES, CONTENT_TYPES, WEEKS } from '@/lib/supabase/types'

export default function SingleMaterialForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [title, setTitle] = useState('')
  const [link, setLink] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [contentType, setContentType] = useState('')
  const [week, setWeek] = useState('')
  const [estimatedTime, setEstimatedTime] = useState('')
  const [tier, setTier] = useState<'optional' | 'core' | 'reference'>('optional')
  const [justification, setJustification] = useState('')

  const [touched, setTouched] = useState<Record<string, boolean>>({})

  function touch(field: string) {
    setTouched(prev => ({ ...prev, [field]: true }))
  }

  const errors = {
    title: !title.trim() ? 'Name is required' : null,
    link: !link.trim() ? 'Link is required' : null,
    description: !description.trim() ? 'Description is required' : null,
    category: !category ? 'Category is required' : null,
  }

  const isValid = !errors.title && !errors.link && !errors.description && !errors.category

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setTouched({ title: true, link: true, description: true, category: true })
    if (!isValid) return

    setLoading(true)
    setError(null)

    const result = await uploadMaterials([{
      title: title.trim(),
      link: link.trim(),
      description: description.trim(),
      categories: [category],
      content_type: contentType || undefined,
      week: week || undefined,
      estimated_time: estimatedTime.trim() || undefined,
      material_tier: tier,
      justification_for_assignment: justification.trim() || undefined,
    }])

    setLoading(false)

    if (result?.error) {
      setError(result.error)
    } else {
      setSuccess(true)
      setTimeout(() => {
        router.push('/library')
      }, 1500)
    }
  }

  if (success) {
    return (
      <div className="py-8 text-center">
        <div className="w-14 h-14 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="text-lg font-semibold text-gray-900">Material Added!</p>
        <p className="text-sm text-muted mt-1">Redirecting to library...</p>
      </div>
    )
  }

  const inputClass = (field: string) =>
    `w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary ${
      touched[field] && errors[field as keyof typeof errors]
        ? 'border-red-400 bg-red-50'
        : 'border-border'
    }`

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          onBlur={() => touch('title')}
          placeholder="e.g. Prompt Engineering Guide"
          className={inputClass('title')}
        />
        {touched.title && errors.title && (
          <p className="text-xs text-red-500 mt-1">{errors.title}</p>
        )}
      </div>

      {/* Link */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Link <span className="text-red-500">*</span>
        </label>
        <input
          type="url"
          value={link}
          onChange={e => setLink(e.target.value)}
          onBlur={() => touch('link')}
          placeholder="https://..."
          className={inputClass('link')}
        />
        {touched.link && errors.link && (
          <p className="text-xs text-red-500 mt-1">{errors.link}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description <span className="text-red-500">*</span>
        </label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          onBlur={() => touch('description')}
          placeholder="Brief description of the material..."
          rows={3}
          className={inputClass('description')}
        />
        {touched.description && errors.description && (
          <p className="text-xs text-red-500 mt-1">{errors.description}</p>
        )}
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Category <span className="text-red-500">*</span>
        </label>
        <select
          value={category}
          onChange={e => setCategory(e.target.value)}
          onBlur={() => touch('category')}
          className={inputClass('category')}
        >
          <option value="">Select a category...</option>
          {CATEGORIES.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        {touched.category && errors.category && (
          <p className="text-xs text-red-500 mt-1">{errors.category}</p>
        )}
      </div>

      {/* Content Type + Week — 2 columns */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Content Type</label>
          <select
            value={contentType}
            onChange={e => setContentType(e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            <option value="">Any type</option>
            {CONTENT_TYPES.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Week</label>
          <select
            value={week}
            onChange={e => setWeek(e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            <option value="">No week</option>
            {WEEKS.map(w => (
              <option key={w} value={w}>{w}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Estimated Time */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Time</label>
        <input
          type="text"
          value={estimatedTime}
          onChange={e => setEstimatedTime(e.target.value)}
          placeholder="e.g. 30 min, 1–2 hours"
          className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        />
      </div>

      {/* Tier selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Material Tier</label>
        <select
          value={tier}
          onChange={e => setTier(e.target.value as 'optional' | 'core' | 'reference')}
          className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        >
          <option value="optional">Optional — good supplementary content</option>
          <option value="core">💎 Core — required reading for the week</option>
          <option value="reference">📌 Reference — tools, platforms, evergreen</option>
        </select>
        <p className="text-xs text-muted mt-1">
          {tier === 'core' && 'Core materials are highlighted and count toward weekly progress tracking.'}
          {tier === 'reference' && 'Reference materials appear in the Reference tab for cross-week tools and resources.'}
          {tier === 'optional' && 'Optional materials are available for those who want to go deeper.'}
        </p>
      </div>

      {/* Justification for assignment — shown for Core and Optional */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Justification for Assignment{tier === 'core' && <span className="text-amber-600 ml-1 text-xs">(recommended for Core)</span>}
        </label>
        <textarea
          value={justification}
          onChange={e => setJustification(e.target.value)}
          placeholder="Why was this material assigned? e.g. 'Foundational read for understanding AI workflow automation...'"
          rows={2}
          className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        />
        <p className="text-xs text-muted mt-1">This note is shown on the material card to help participants understand its relevance.</p>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
      >
        {loading ? 'Adding...' : 'Add Material'}
      </button>

      <p className="text-xs text-muted text-center">
        <span className="text-red-500">*</span> Required fields
      </p>
    </form>
  )
}
