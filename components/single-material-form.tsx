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
  const [isEssential, setIsEssential] = useState(false)

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
      is_essential: isEssential,
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

      {/* Essential toggle */}
      <label className="flex items-center gap-3 cursor-pointer select-none">
        <div className="relative">
          <input
            type="checkbox"
            checked={isEssential}
            onChange={e => setIsEssential(e.target.checked)}
            className="sr-only"
          />
          <div className={`w-10 h-6 rounded-full transition-colors ${isEssential ? 'bg-amber-400' : 'bg-gray-200'}`} />
          <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${isEssential ? 'translate-x-4' : ''}`} />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-700">💎 Mark as Essential</p>
          <p className="text-xs text-muted">Essential materials are highlighted across the platform</p>
        </div>
      </label>

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
