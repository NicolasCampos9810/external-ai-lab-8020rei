'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function ProfilePage() {
  const [fullName, setFullName] = useState('')
  const [company, setCompany] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, company, email, role')
        .eq('id', user.id)
        .single()
      if (profile) {
        setFullName(profile.full_name || '')
        setCompany(profile.company || '')
        setEmail(profile.email || '')
        setRole(profile.role || '')
      }
      setLoading(false)
    }
    load()
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setMessage(null)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { error } = await supabase
      .from('profiles')
      .update({ full_name: fullName.trim() || null, company: company.trim() || null })
      .eq('id', user.id)
    if (error) {
      setMessage({ type: 'error', text: 'Failed to save. Please try again.' })
    } else {
      setMessage({ type: 'success', text: 'Profile updated successfully.' })
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="max-w-lg">
        <div className="h-8 w-40 bg-gray-100 rounded animate-pulse mb-6" />
        <div className="bg-card rounded-xl border border-border p-6 space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  const initials = fullName
    ? fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : email.charAt(0).toUpperCase()

  return (
    <div className="max-w-lg">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="text-muted mt-1">Update your personal information</p>
      </div>

      {/* Avatar + identity */}
      <div className="bg-card rounded-xl border border-border p-6 mb-6 flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
          {initials}
        </div>
        <div>
          <p className="font-semibold text-gray-900">{fullName || email}</p>
          <p className="text-sm text-muted">{email}</p>
          <span className="inline-block mt-1 text-xs bg-primary/10 text-primary font-medium px-2 py-0.5 rounded-full capitalize">{role}</span>
        </div>
      </div>

      <form onSubmit={handleSave} className="bg-card rounded-xl border border-border p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
          <input
            type="text"
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            placeholder="Your full name"
            className="w-full px-3 py-2.5 rounded-lg border border-border bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Company</label>
          <input
            type="text"
            value={company}
            onChange={e => setCompany(e.target.value)}
            placeholder="Your company or organization"
            className="w-full px-3 py-2.5 rounded-lg border border-border bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
          <input
            type="email"
            value={email}
            disabled
            className="w-full px-3 py-2.5 rounded-lg border border-border bg-gray-50 text-sm text-gray-500 cursor-not-allowed"
          />
          <p className="text-xs text-muted mt-1">Email cannot be changed here.</p>
        </div>

        {message && (
          <div className={`text-sm px-3 py-2.5 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {message.text}
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="w-full py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors disabled:opacity-60"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  )
}
