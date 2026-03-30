'use client'

import { useMemo } from 'react'
import { LaunchCard } from './LaunchCard'
import { getMonthKey } from '@/lib/utils'

interface Launch {
  id: string
  launchName: string
  vertical: string | null
  hardLaunchDate: string | null
  status: string | null
  brand: string | null
}

interface LaunchCalendarProps {
  launches: Launch[]
}

const MONTH_ORDER = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

export function LaunchCalendar({ launches }: LaunchCalendarProps) {
  const grouped = useMemo(() => {
    const groups: Record<string, Launch[]> = { Uncategorized: [] }

    for (const launch of launches) {
      const key = getMonthKey(launch.hardLaunchDate)
      if (!groups[key]) groups[key] = []
      groups[key].push(launch)
    }

    return groups
  }, [launches])

  // Sort columns: Uncategorized first, then months in calendar order by year+month
  const columns = useMemo(() => {
    const keys = Object.keys(grouped)
    const uncategorized = keys.filter((k) => k === 'Uncategorized')
    const months = keys
      .filter((k) => k !== 'Uncategorized')
      .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
    return [...uncategorized, ...months]
  }, [grouped])

  if (launches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-400">
        <p className="text-lg font-medium">No launches yet</p>
        <p className="text-sm mt-1">
          <a href="/launches/new" className="text-[#2D1169] hover:underline">
            Create your first launch
          </a>{' '}
          to get started
        </p>
      </div>
    )
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 min-h-[calc(100vh-120px)]">
      {columns.map((month) => {
        const items = grouped[month] ?? []
        // Short month label (e.g., "January 2026" → "January")
        const label = month === 'Uncategorized' ? 'Uncategorized' : month.split(' ')[0]

        return (
          <div key={month} className="flex-shrink-0 w-[240px]">
            {/* Column header */}
            <div className="flex items-center gap-2 mb-3">
              <span className={`text-sm font-semibold ${month === 'Uncategorized' ? 'text-gray-500' : 'text-gray-900'}`}>
                {label}
              </span>
              <span className={`
                text-xs font-medium rounded-full px-2 py-0.5
                ${month === 'Uncategorized'
                  ? 'bg-gray-100 text-gray-500'
                  : 'bg-blue-100 text-blue-700'}
              `}>
                {items.length}
              </span>
            </div>

            {/* Cards */}
            <div className="space-y-2.5">
              {items.length === 0 ? (
                <p className="text-xs text-gray-400 px-1">No drafts</p>
              ) : (
                items.map((launch) => (
                  <LaunchCard key={launch.id} {...launch} />
                ))
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
