import Link from 'next/link'
import { Plus } from 'lucide-react'
import { db } from '@/db'
import { launches } from '@/db/schema'
import { asc } from 'drizzle-orm'
import { LaunchCalendar } from '@/components/launches/LaunchCalendar'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const allLaunches = await db
    .select({
      id: launches.id,
      launchName: launches.launchName,
      vertical: launches.vertical,
      hardLaunchDate: launches.hardLaunchDate,
      status: launches.status,
      brand: launches.brand,
    })
    .from(launches)
    .orderBy(asc(launches.hardLaunchDate))

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Tentative Launch Plans</h1>
          <p className="text-sm text-gray-500 mt-0.5">All launches grouped by month</p>
        </div>
        <Link href="/launches/new" className="btn-primary flex items-center gap-1.5">
          <Plus className="w-4 h-4" />
          New Launch
        </Link>
      </div>

      {/* Calendar */}
      <LaunchCalendar launches={allLaunches} />
    </div>
  )
}
