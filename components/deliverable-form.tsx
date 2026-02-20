'use client'

import { useState, useTransition } from 'react'
import { submitDeliverable } from '@/lib/actions/week-content'

interface Props {
  week: string
  existingLink: string | null
  existingSubmittedAt: string | null
}

export default function DeliverableForm({ week, existingLink, existingSubmittedAt }: Props) {
  const [link, setLink] = useState(existingLink ?? '')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    startTransition(async () => {
      const result = await submitDeliverable(week, link)
      if (result?.error) {
        setError(result.error)
      } else {
        setSuccess(true)
      }
    })
  }

  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <h3 className="font-semibold text-gray-900 mb-1">
        {existingLink ? 'Your Submission' : 'Submit Your Deliverable'}
      </h3>
      {existingLink && existingSubmittedAt && (
        <p className="text-xs text-muted mb-3">
          Submitted {new Date(existingSubmittedAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        {error && (
          <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">{error}</p>
        )}
        {success && (
          <p className="text-xs text-green-600 bg-green-50 border border-green-200 rounded px-3 py-2">
            ✓ Deliverable {existingLink ? 'updated' : 'submitted'} successfully!
          </p>
        )}

        <input
          type="url"
          value={link}
          onChange={e => setLink(e.target.value)}
          placeholder="https://..."
          required
          className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        />

        <button
          type="submit"
          disabled={isPending || !link.trim()}
          className="px-5 py-2 bg-primary text-white text-sm rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
        >
          {isPending ? 'Submitting...' : existingLink ? 'Update Submission' : 'Submit'}
        </button>
      </form>
    </div>
  )
}
