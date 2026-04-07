import Link from 'next/link'
import { formatDate } from '@/lib/utils'
import { VERTICAL_STYLES } from '@/lib/constants'
import { cn } from '@/lib/utils'

interface LaunchCardProps {
  id: string
  launchName: string
  vertical: string | null
  hardLaunchDate: string | null
  status: string | null
  brand: string | null
}

export function LaunchCard({ id, launchName, vertical, hardLaunchDate, status, brand }: LaunchCardProps) {
  const verticalStyle = vertical ? VERTICAL_STYLES[vertical] ?? 'bg-gray-100 text-gray-600' : null

  return (
    <Link href={`/launches/${id}`}>
      <div className="card p-3.5 hover:shadow-md transition-shadow cursor-pointer">
        <h3 className="font-semibold text-sm text-gray-900 leading-snug mb-2.5">
          {launchName}
        </h3>

        <div className="space-y-1.5 text-xs">
          {brand && (
            <div>
              <span className="text-gray-500">Brand</span>
              <p className="text-gray-800 font-medium">{brand}</p>
            </div>
          )}

          {vertical && (
            <div className="flex items-center gap-1.5">
              <span className="text-gray-500">Vertical</span>
              <span className={cn('badge', verticalStyle)}>{vertical}</span>
            </div>
          )}

          {hardLaunchDate && (
            <div>
              <span className="text-gray-500">Launch Date</span>
              <p className="text-gray-800">{formatDate(hardLaunchDate)}</p>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
