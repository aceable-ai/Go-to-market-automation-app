import Link from 'next/link'
import { db } from '@/db'
import { launches, onePagers } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { cn, formatDate } from '@/lib/utils'
import { VERTICAL_STYLES } from '@/lib/constants'
import { FileText, Pencil, ChevronRight } from 'lucide-react'

export const dynamic = 'force-dynamic'

const PAGER_FIELDS = [
  'brandContent', 'productNotes', 'executiveSummary', 'regulatoryContext',
  'competitiveLandscape', 'audienceInsights', 'valuePropPositioning',
  'stateSpecificMessaging', 'pricingNotes', 'finalMsrp', 'finalSalePrice',
  'finalPromoPrice', 'finalPromoCode', 'competitivePosition', 'marketData',
  'salaryData', 'scopeOfferFeatures', 'seasonalTrends', 'regulatoryNotes',
  'exploitableMarketGaps', 'messagingGuidelines', 'sourceCoursesAndBundles',
  'personaMessageMap',
] as const

function completeness(pager: Record<string, unknown> | null): number {
  if (!pager) return 0
  const filled = PAGER_FIELDS.filter((f) => {
    const v = pager[f]
    if (!v) return false
    if (typeof v === 'object' && 'value' in (v as object)) return !!(v as { value: string }).value
    return true
  }).length
  return Math.round((filled / PAGER_FIELDS.length) * 100)
}

function ProgressBar({ pct }: { pct: number }) {
  const color = pct === 100 ? 'bg-green-500' : pct >= 50 ? 'bg-yellow-400' : 'bg-red-400'
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-gray-100 rounded-full h-1.5">
        <div className={cn('h-1.5 rounded-full', color)} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-gray-500 w-8 text-right">{pct}%</span>
    </div>
  )
}

export default async function OnePagersPage() {
  const allLaunches = await db.select().from(launches).orderBy(launches.hardLaunchDate)
  const allPagers = await db.select().from(onePagers)

  const pagerByLaunch = Object.fromEntries(allPagers.map((p) => [p.launchId, p]))

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">PMM One-Pager Review</h1>
          <p className="text-sm text-gray-500 mt-0.5">{allLaunches.length} launches</p>
        </div>
        <Link href="/launches/new" className="btn-primary">
          + New Launch
        </Link>
      </div>

      {allLaunches.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <FileText className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="text-sm">No launches yet. Create one to get started.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {allLaunches.map((launch) => {
            const pager = pagerByLaunch[launch.id] ?? null
            const pct = completeness(pager as Record<string, unknown> | null)
            const verticalStyle = launch.vertical
              ? VERTICAL_STYLES[launch.vertical] ?? 'bg-gray-100 text-gray-600'
              : null

            return (
              <div
                key={launch.id}
                className="card p-4 flex items-center gap-4 hover:shadow-md transition-shadow"
              >
                {/* Icon */}
                <div className="shrink-0 w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center">
                  <FileText className="w-4 h-4 text-[#2D1169]" />
                </div>

                {/* Launch info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-900 truncate">{launch.launchName}</span>
                    {launch.vertical && (
                      <span className={cn('badge shrink-0', verticalStyle)}>{launch.vertical}</span>
                    )}
                    {launch.state && (
                      <span className="badge bg-gray-100 text-gray-600 shrink-0">{launch.state}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    {launch.brand && <span>{launch.brand}</span>}
                    {launch.hardLaunchDate && (
                      <span>Launch: {formatDate(launch.hardLaunchDate)}</span>
                    )}
                    {launch.status && (
                      <span className="badge bg-purple-50 text-purple-700">{launch.status}</span>
                    )}
                  </div>
                </div>

                {/* Completeness */}
                <div className="w-36 shrink-0">
                  <p className="text-xs text-gray-400 mb-1">One-pager</p>
                  <ProgressBar pct={pct} />
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    href={`/launches/${launch.id}/one-pager/edit`}
                    className="btn-secondary flex items-center gap-1 text-xs py-1.5 px-3"
                  >
                    <Pencil className="w-3 h-3" />
                    Edit
                  </Link>
                  <Link
                    href={`/launches/${launch.id}/one-pager`}
                    className="btn-secondary flex items-center gap-1 text-xs py-1.5 px-3"
                  >
                    View
                    <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
