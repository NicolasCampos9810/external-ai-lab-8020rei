'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toggleWeekSubmissions } from '@/lib/actions/week-content'

interface Props {
  week: string
  submissionsClosed: boolean
}

export default function WeekSubmissionsToggle({ week, submissionsClosed }: Props) {
  const router = useRouter()
  const [closed, setClosed] = useState(submissionsClosed)
  const [isPending, startTransition] = useTransition()

  function handleToggle() {
    const newClosed = !closed
    setClosed(newClosed)
    startTransition(async () => {
      const result = await toggleWeekSubmissions(week, newClosed)
      if (result?.error) {
        setClosed(closed)
      } else {
        router.refresh()
      }
    })
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      title={closed ? `Open submissions for ${week}` : `Close submissions for ${week} — no new uploads allowed`}
      className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 ${
        closed
          ? 'bg-red-100 text-red-700 hover:bg-red-200 border border-red-300'
          : 'bg-blue-100 text-blue-700 hover:bg-blue-200 border border-blue-300'
      }`}
    >
      <span>{closed ? '🔐' : '📬'}</span>
      <span>{isPending ? '...' : closed ? 'Submissions closed' : 'Submissions open'}</span>
    </button>
  )
}
