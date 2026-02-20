'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateWeekContent(
  week: string,
  fields: {
    title?: string
    description?: string
    objectives?: string[]
    homework?: string
    deliverable_prompt?: string
  }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') return { error: 'Not authorized' }

  const { error } = await supabase
    .from('week_content')
    .upsert({ week, ...fields, updated_at: new Date().toISOString() }, { onConflict: 'week' })

  if (error) return { error: error.message }

  revalidatePath('/weekly')
  return { success: true }
}

export async function submitDeliverable(week: string, content: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('deliverables')
    .upsert(
      { user_id: user.id, week, content, updated_at: new Date().toISOString() },
      { onConflict: 'user_id,week' }
    )

  if (error) return { error: error.message }

  revalidatePath('/weekly')
  return { success: true }
}
