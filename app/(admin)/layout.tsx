import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Sidebar from '@/components/dashboard/Sidebar'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  let profile = null
  try {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    profile = data
  } catch {
    // profiles table may not exist yet
  }

  if (profile?.role !== 'admin') {
    redirect('/dashboard')
  }

  // Fetch user stats for the sidebar
  let resourcesAdded = 0
  let resourcesRated = 0
  try {
    const { count: addedCount } = await supabase
      .from('resources')
      .select('*', { count: 'exact', head: true })
      .eq('added_by', user.id)
    resourcesAdded = addedCount ?? 0

    const { count: ratedCount } = await supabase
      .from('resources')
      .select('*', { count: 'exact', head: true })
      .eq('added_by', user.id)
      .not('quality_rating', 'is', null)
    resourcesRated = ratedCount ?? 0
  } catch {
    // tables may not exist yet
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar
        profile={profile}
        stats={{ resourcesAdded, resourcesRated }}
      />
      <main className="flex-1 p-6 overflow-auto">
        {children}
      </main>
    </div>
  )
}
