'use client'

import { useState, useTransition } from 'react'
import { submitDeliverable } from '@/lib/actions/week-content'

interface Props {
  week: string
  existingLink: string | null
  existingNotes: string | null
  existingSubmittedAt: string | null
  submissionsClosed: boolean
}

export default function DeliverableForm({ week, existingLink, existingNotes, existingSubmittedAt, submissionsClosed }: Props) {
  const [link, setLink] = useState(existingLink ?? '')
  const [notes, setNotes] = useState(existingNotes ?? '')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    startTransition(async () => {
      const result = await submitDeliverable(week, link, notes)
      if (result?.error) {
        setError(result.error)
      } else {
        setSuccess(true)
      }
    })
  }

  const hasExisting = !!(existingLink || existingNotes)
  const canSubmit = !!(link.trim() && notes.trim())

  // Submissions closed — show status banner instead of form
  if (submissionsClosed) {
    return (
      <div className={`rounded-xl border p-6 ${
        hasExisting
          ? 'bg-green-50 border-green-200'
          : 'bg-gray-50 border-gray-200'
      }`}>
        {hasExisting ? (
          <>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-green-700 font-semibold">✓ Submitted on time</span>
              <span className="text-xs bg-green-100 text-green-700 border border-green-300 px-2 py-0.5 rounded-full font-medium">Submissions closed</span>
            </div>
            {existingSubmittedAt && (
              <p className="text-xs text-green-600 mb-3">
                Submitted {new Date(existingSubmittedAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
            )}
            <div className="space-y-2 text-sm text-gray-700">
              {existingLink && (
                <a
                  href={existingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-primary hover:underline break-all"
                >
                  {existingLink}
                </a>
              )}
              {existingNotes && (
                <p className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">{existingNotes}</p>
              )}
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-gray-500 font-semibold">🔐 Submissions closed</span>
            </div>
            <p className="text-sm text-gray-500">
              The deadline for this week has passed. No new submissions are accepted.
            </p>
          </>
        )}
      </div>
    )
  }

  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <h3 className="font-semibold text-gray-900 mb-1">
        {hasExisting ? 'Your Submission' : 'Submit your deliverable'}
      </h3>
      {hasExisting && existingSubmittedAt && (
        <p className="text-xs text-muted mb-3">
          Submitted {new Date(existingSubmittedAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </p>
      )}

      <p className="text-xs text-gray-500 mb-4 leading-relaxed">
        Both fields are required. Your link can be:
        <span className="block mt-1.5 space-y-0.5 pl-1">
          <span className="block">· A repository (GitHub, GitLab, etc.)</span>
          <span className="block">· A video showcasing your deliverable</span>
          <span className="block">· A link to access your work</span>
        </span>
        Your description should answer that week&apos;s objectives.
      </p>

      <form onSubmit={handleSubmit} className="space-y-3">
        {error && (
          <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">{error}</p>
        )}
        {success && (
          <p className="text-xs text-green-600 bg-green-50 border border-green-200 rounded px-3 py-2">
            ✓ Deliverable {hasExisting ? 'updated' : 'submitted'} successfully!
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

        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Add a description or reflection on this week's objectives..."
          rows={4}
          required
          className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
        />

        <button
          type="submit"
          disabled={isPending || !canSubmit}
          className="px-5 py-2 bg-primary text-white text-sm rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
        >
          {isPending ? 'Submitting...' : hasExisting ? 'Update Submission' : 'Submit'}
        </button>
      </form>
    </div>
  )
}
