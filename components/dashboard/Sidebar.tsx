'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import SignOutButton from '@/components/auth/SignOutButton'
import type { Database } from '@/lib/supabase/database.types'
import {
  Home,
  BookOpen,
  Calendar,
  Plus,
  Download,
  Shield,
  Users,
  Activity,
  Star,
  FileText,
} from 'lucide-react'

type Profile = Database['public']['Tables']['profiles']['Row']

interface SidebarProps {
  profile: Profile | null
  stats: {
    resourcesAdded: number
    resourcesRated: number
  }
}

const browseLinks = [
  { href: '/dashboard', label: 'Home', icon: Home },
  { href: '/library', label: 'Master Library', icon: BookOpen },
  { href: '/weekly', label: 'Weekly Plans', icon: Calendar },
]

const manageLinks = [
  { href: '/add', label: 'Add New Content', icon: Plus },
  { href: '/import', label: 'Bulk Import', icon: Download },
]

const adminLinks = [
  { href: '/admin', label: 'Admin Overview', icon: Shield },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/activity', label: 'Activity Log', icon: Activity },
]

export default function Sidebar({ profile, stats }: SidebarProps) {
  const pathname = usePathname()
  const role = profile?.role ?? 'member'

  return (
    <aside className="w-72 bg-white border-r border-gray-200 min-h-screen flex flex-col">
      {/* Profile Card */}
      <div className="p-5 border-b border-gray-200">
        <div className="flex items-center gap-3 mb-4">
          {profile?.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt=""
              className="w-12 h-12 rounded-full ring-2 ring-gray-100"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center ring-2 ring-blue-100">
              <span className="text-lg font-semibold text-white">
                {(profile?.full_name || profile?.email || '?')[0].toUpperCase()}
              </span>
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {profile?.full_name || 'User'}
            </p>
            <p className="text-xs text-gray-500 truncate">{profile?.email}</p>
            <span
              className={`inline-flex items-center mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                role === 'admin'
                  ? 'bg-purple-100 text-purple-700'
                  : 'bg-blue-100 text-blue-700'
              }`}
            >
              {role === 'admin' ? 'Admin' : 'Member'}
            </span>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-gray-50 rounded-lg px-3 py-2 text-center">
            <div className="flex items-center justify-center gap-1 text-gray-500 mb-0.5">
              <FileText className="w-3 h-3" />
              <span className="text-xs">Added</span>
            </div>
            <p className="text-lg font-bold text-gray-900">{stats.resourcesAdded}</p>
          </div>
          <div className="bg-gray-50 rounded-lg px-3 py-2 text-center">
            <div className="flex items-center justify-center gap-1 text-gray-500 mb-0.5">
              <Star className="w-3 h-3" />
              <span className="text-xs">Rated</span>
            </div>
            <p className="text-lg font-bold text-gray-900">{stats.resourcesRated}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
        <NavSection label="Navigate" links={browseLinks} pathname={pathname} />

        {role === 'admin' && (
          <>
            <NavSection label="Manage Content" links={manageLinks} pathname={pathname} />
            <NavSection label="Admin Panel" links={adminLinks} pathname={pathname} />
          </>
        )}
      </nav>

      {/* Sign Out */}
      <div className="p-4 border-t border-gray-200">
        <SignOutButton />
      </div>
    </aside>
  )
}

function NavSection({
  label,
  links,
  pathname,
}: {
  label: string
  links: { href: string; label: string; icon: React.ComponentType<{ className?: string }> }[]
  pathname: string
}) {
  return (
    <div>
      <p className="px-3 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
        {label}
      </p>
      <div className="space-y-1">
        {links.map(link => {
          const Icon = link.icon
          const isActive = pathname === link.href
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-700 shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              {link.label}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
