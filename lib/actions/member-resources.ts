'use server'

import { createClient } from '@/lib/supabase/server'

export async function addMemberResource(
  week: string,
  title: string,
  link: string,
  description?: string
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const trimmedTitle = title.trim()
  const trimmedLink = link.trim()
  if (!trimmedTitle) return { error: 'Title is required' }
  if (!trimmedLink) return { error: 'Link is required' }

  const { error } = await supabase.from('member_resources').insert({
    week,
    title: trimmedTitle,
    link: trimmedLink,
    description: description?.trim() || null,
    added_by: user.id,
  })

  if (error) return { error: error.message }
  return { success: true }
}

export async function deleteMemberResource(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('member_resources')
    .delete()
    .eq('id', id)

  if (error) return { error: error.message }
  return { success: true }
}
