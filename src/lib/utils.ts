import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return '—'
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function getMonthKey(date: string | Date | null | undefined): string {
  if (!date) return 'Uncategorized'
  const d = typeof date === 'string' ? new Date(date + 'T00:00:00') : date
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

export function groupByMonth<T extends { hardLaunchDate?: string | null }>(
  items: T[]
): Record<string, T[]> {
  const groups: Record<string, T[]> = { Uncategorized: [] }
  for (const item of items) {
    const key = getMonthKey(item.hardLaunchDate)
    if (!groups[key]) groups[key] = []
    groups[key].push(item)
  }
  return groups
}

export function initials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}
