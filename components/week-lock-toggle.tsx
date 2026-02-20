'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toggleWeekEnabled } from '@/lib/actions/week-content'

interface Props {
  week: string
  isEnabled: boolean
}

export default function WeekLockToggle({ week, isEnabled }: Props) {
  const router = useRouter()
  const [enabled, setEnabled] = useState(isEnabled)
  const [isPending, startTransition] = useTransition()

  function handleToggle() {
    const newEnabled = !enabled
    setEnabled(newEnabled)
    startTransition(async () => {
      const result = await toggleWeekEnabled(week, newEnabled)
      if (result?.error) {
        // Revert optimistic update on error
        setEnabled(enabled)
      } else {
        router.refresh()
      }
    })
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      title={enabled ? `Lock ${week} (hide from participants)` : `Unlock ${week} (make visible to participants)`}
      className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 ${
        enabled
          ? 'bg-green-100 text-green-700 hover:bg-green-200 border border-green-300'
          : 'bg-gray-100 text-gray-500 hover:bg-gray-200 border border-gray-300'
      }`}
    >
      <span>{enabled ? '🔓' : '🔒'}</span>
      <span>{isPending ? '...' : enabled ? 'Visible' : 'Locked'}</span>
    </button>
  )
}
