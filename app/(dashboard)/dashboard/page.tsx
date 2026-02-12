'use client'

import Link from 'next/link'
import {
  BookOpen,
  Calendar,
  Plus,
  Star,
  TrendingUp,
  CheckCircle,
  ArrowRight,
} from 'lucide-react'

const steps = [
  {
    number: '1',
    title: 'Browse the Master Library',
    description:
      'Explore our curated collection of AI training resources — articles, videos, tutorials, and more — organized by topic and skill level.',
    icon: BookOpen,
    href: '/library',
    color: 'blue',
  },
  {
    number: '2',
    title: 'Follow the Weekly Plans',
    description:
      'Each week has a structured learning path with recommended content. Work through them at your own pace to build skills progressively.',
    icon: Calendar,
    href: '/weekly',
    color: 'green',
  },
  {
    number: '3',
    title: 'Rate & Review Content',
    description:
      'After consuming a resource, rate its quality and relevance. Your ratings help the team prioritize the best material.',
    icon: Star,
    href: '/library',
    color: 'yellow',
  },
  {
    number: '4',
    title: 'Add New Content',
    description:
      'Found a great resource? Add it to the library so the entire team can benefit. Tag it with the right topic and skill level.',
    icon: Plus,
    href: '/add',
    color: 'purple',
  },
]

const colorMap: Record<string, { bg: string; text: string; border: string; iconBg: string }> = {
  blue: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', iconBg: 'bg-blue-100' },
  green: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', iconBg: 'bg-green-100' },
  yellow: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', iconBg: 'bg-amber-100' },
  purple: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', iconBg: 'bg-purple-100' },
}

export default function DashboardPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome to AI Training Platform
        </h1>
        <p className="mt-2 text-lg text-gray-600">
          Your team&apos;s central hub for curating, organizing, and learning from the best AI resources.
        </p>
      </div>

      {/* How It Works */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">How It Works</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {steps.map(step => {
            const Icon = step.icon
            const colors = colorMap[step.color]
            return (
              <Link
                key={step.number}
                href={step.href}
                className={`group relative block rounded-xl border ${colors.border} ${colors.bg} p-5 transition-shadow hover:shadow-md`}
              >
                <div className="flex items-start gap-4">
                  <div className={`flex-shrink-0 w-10 h-10 rounded-lg ${colors.iconBg} flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${colors.text}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className={`text-sm font-semibold ${colors.text} mb-1`}>
                      Step {step.number}: {step.title}
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
                <ArrowRight className={`absolute top-5 right-4 w-4 h-4 ${colors.text} opacity-0 group-hover:opacity-100 transition-opacity`} />
              </Link>
            )
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <Link
            href="/library"
            className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <BookOpen className="w-4 h-4 text-blue-600" />
            Open Master Library
          </Link>
          <Link
            href="/weekly"
            className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Calendar className="w-4 h-4 text-green-600" />
            View Weekly Plans
          </Link>
          <Link
            href="/add"
            className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Plus className="w-4 h-4 text-purple-600" />
            Add New Content
          </Link>
        </div>
      </div>

      {/* Platform Goals */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Platform Goals</h2>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-900">Centralize AI Learning</p>
              <p className="text-sm text-gray-500">One place for all AI training resources — no more scattered bookmarks.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <TrendingUp className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-900">Track Quality</p>
              <p className="text-sm text-gray-500">Rate and review resources so the team can focus on what works best.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Calendar className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-900">Structured Learning</p>
              <p className="text-sm text-gray-500">Weekly plans guide your learning journey from beginner to advanced.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
