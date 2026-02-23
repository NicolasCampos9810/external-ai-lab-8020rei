'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { addMemberResource, deleteMemberResource } from '@/lib/actions/member-resources'
import type { MemberResource } from '@/lib/supabase/types'

interface Props {
  week: string
  resources: MemberResource[]
  userId: string | null
  isAdmin: boolean
}

export default function MemberResourcesSection({ week, resources, userId, isAdmin }: Props) {
  const router = useRouter()
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [link, setLink] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function resetForm() {
    setTitle('')
    setLink('')
    setDescription('')
    setError('')
    setShowForm(false)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    startTransition(async () => {
      const result = await addMemberResource(week, title, link, description)
      if ('error' in result && result.error) {
        setError(result.error)
      } else {
        resetForm()
        router.refresh()
      }
    })
  }

  function handleDelete(id: string) {
    if (!confirm('Remove this resource?')) return
    setDeletingId(id)
    startTransition(async () => {
      await deleteMemberResource(id)
      setDeletingId(null)
      router.refresh()
    })
  }

  return (
    <div className="mt-8 pt-6 border-t border-border">
      {/* Section header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
            🌱 Members Resources — {resources.length} {resources.length === 1 ? 'resource' : 'resources'}
          </span>
        </div>
        {userId && !showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="text-sm text-primary font-medium hover:underline"
          >
            + Share a resource
          </button>
        )}
      </div>

      {/* Add form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="mb-5 bg-emerald-50 border border-emerald-200 rounded-xl p-4 space-y-3">
          <p className="text-sm font-semibold text-emerald-900">Share a resource with the group</p>
          <div>
            <input
              type="text"
              placeholder="Title *"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
              className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
          </div>
          <div>
            <input
              type="url"
              placeholder="Link (https://…) *"
              value={link}
              onChange={e => setLink(e.target.value)}
              required
              className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
          </div>
          <div>
            <textarea
              placeholder="Why is this useful? (optional)"
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400 resize-none"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isPending}
              className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors"
            >
              {isPending ? 'Sharing…' : 'Share'}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Resource list */}
      {resources.length > 0 ? (
        <div className="space-y-3">
          {resources.map(resource => (
            <div
              key={resource.id}
              className="bg-card border border-border rounded-xl p-4 flex items-start gap-3"
            >
              <div className="flex-1 min-w-0">
                <a
                  href={resource.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-semibold text-primary hover:underline break-words"
                >
                  {resource.title}
                </a>
                {resource.description && (
                  <p className="text-sm text-muted mt-1">{resource.description}</p>
                )}
                <p className="text-xs text-gray-400 mt-1">
                  Shared by {resource.adder?.full_name || resource.adder?.email || 'a member'}
                  {' · '}
                  {new Date(resource.created_at).toLocaleDateString()}
                </p>
              </div>
              {(userId === resource.added_by || isAdmin) && (
                <button
                  onClick={() => handleDelete(resource.id)}
                  disabled={deletingId === resource.id || isPending}
                  className="flex-shrink-0 text-xs text-gray-400 hover:text-red-500 disabled:opacity-50 transition-colors mt-0.5"
                  title="Remove resource"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted">
          No member resources yet.{userId ? ' Be the first to share one!' : ''}
        </p>
      )}
    </div>
  )
}
