import Link from 'next/link'
import { db } from '@/db'
import { launches, onePagers } from '@/db/schema'
import { cn, formatDate } from '@/lib/utils'
import { VERTICAL_STYLES } from '@/lib/constants'
import { FileText, Pencil, ExternalLink } from 'lucide-react'
import { DeleteOnePagerButton } from '@/components/launches/DeleteOnePagerButton'

export const dynamic = 'force-dynamic'

const PMM_STATUS_STYLES: Record<string, string> = {
  draft:    'bg-amber-100 text-amber-700',
  review:   'bg-blue-100 text-blue-700',
  approved: 'bg-green-100 text-green-700',
  pushed:   'bg-purple-100 text-purple-700',
}

const REQUIRED_FIELDS = [
  'executiveSummary', 'sourceCoursesAndBundles', 'competitiveLandscape',
  'audienceInsights', 'valuePropPositioning', 'trustSignals',
] as const

function completeness(pager: Record<string, unknown>): number {
  const filled = REQUIRED_FIELDS.filter((f) => {
    const v = pager[f]
    if (!v) return false
    if (typeof v === 'string') return v.trim().length > 0
    return true
  }).length
  return Math.round((filled / REQUIRED_FIELDS.length) * 100)
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
  const allPagers = await db.select().from(onePagers).orderBy(onePagers.createdAt)

  // Enrich with launch data where available
  const allLaunches = await db.select().from(launches)
  const launchById = Object.fromEntries(allLaunches.map((l) => [l.id, l]))

  const jiraBaseUrl = process.env.JIRA_BASE_URL ?? 'https://aceable.atlassian.net'

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">PMM One-Pager Review</h1>
          <p className="text-sm text-gray-500 mt-0.5">{allPagers.length} one-pagers</p>
        </div>
        <Link href="/launches/new" className="btn-primary">+ New Launch</Link>
      </div>

      {allPagers.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <FileText className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="text-sm">No one-pagers yet. Run a launch through n8n to get started.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {allPagers.map((pager) => {
            const launch = pager.launchId ? launchById[pager.launchId] : null
            const pct = completeness(pager as Record<string, unknown>)
            const pmmStatus = pager.pmmStatus ?? 'draft'
            const statusStyle = PMM_STATUS_STYLES[pmmStatus] ?? 'bg-gray-100 text-gray-600'
            const label = pager.launchName || launch?.launchName || pager.airtableRecordId || pager.id
            const verticalStyle = launch?.vertical ? VERTICAL_STYLES[launch.vertical] ?? 'bg-gray-100 text-gray-600' : null
            const editHref = pager.launchId
              ? `/launches/${pager.launchId}/one-pager/edit`
              : `/one-pagers/${pager.id}/edit`

            return (
              <div key={pager.id} className="card p-4 flex items-center gap-4 hover:shadow-md transition-shadow">
                <div className="shrink-0 w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center">
                  <FileText className="w-4 h-4 text-indigo-600" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-900 truncate">{label}</span>
                    {launch?.vertical && <span className={cn('badge shrink-0', verticalStyle)}>{launch.vertical}</span>}
                    {launch?.state && <span className="badge bg-gray-100 text-gray-600 shrink-0">{launch.state}</span>}
                    <span className={cn('badge shrink-0', statusStyle)}>{pmmStatus}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    {pager.pmmOwner && <span>{pager.pmmOwner}</span>}
                    {launch?.hardLaunchDate && <span>Launch: {formatDate(launch.hardLaunchDate)}</span>}
                    {pager.jiraTicketId && (
                      <a
                        href={`${jiraBaseUrl}/browse/${pager.jiraTicketId}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 text-purple-600 font-medium hover:underline"
                      >
                        {pager.jiraTicketId} <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>

                <div className="w-36 shrink-0">
                  <p className="text-xs text-gray-400 mb-1">Required fields</p>
                  <ProgressBar pct={pct} />
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <DeleteOnePagerButton onePagerId={pager.id} />
                  <Link href={editHref} className="btn-secondary flex items-center gap-1 text-xs py-1.5 px-3">
                    <Pencil className="w-3 h-3" /> Edit
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
