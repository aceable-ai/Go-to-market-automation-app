import Link from 'next/link'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { db } from '@/db'
import { launches, onePagers, gtmTasks } from '@/db/schema'
import { asc, eq, sql } from 'drizzle-orm'
import { cn, formatDate } from '@/lib/utils'
import { VERTICAL_STYLES } from '@/lib/constants'
import { DeleteLaunchButton } from '@/components/launches/DeleteLaunchButton'

export const dynamic = 'force-dynamic'

const STATUS_STYLES: Record<string, string> = {
  draft:                'bg-gray-100 text-gray-600',
  kick_off_automation:  'bg-amber-100 text-amber-700',
  processing:           'bg-blue-100 text-blue-700',
  automation_complete:  'bg-green-100 text-green-700',
  confirmed:            'bg-green-100 text-green-700',
  live:                 'bg-purple-100 text-purple-700',
}

const PMM_STATUS_STYLES: Record<string, string> = {
  draft:    'bg-gray-100 text-gray-600',
  review:   'bg-blue-100 text-blue-700',
  approved: 'bg-green-100 text-green-700',
  pushed:   'bg-purple-100 text-purple-700',
}

export default async function HomePage() {
  const allLaunches = await db
    .select()
    .from(launches)
    .orderBy(asc(launches.hardLaunchDate))

  const allPagers = await db.select().from(onePagers)
  const pagerByLaunch = Object.fromEntries(
    allPagers.filter((p) => p.launchId).map((p) => [p.launchId!, p])
  )

  // Task counts per launch
  const taskCounts = await db
    .select({
      launchId: gtmTasks.launchId,
      total: sql<number>`count(*)`,
      done: sql<number>`count(*) filter (where ${gtmTasks.status} = 'Done')`,
    })
    .from(gtmTasks)
    .groupBy(gtmTasks.launchId)
  const taskMap = Object.fromEntries(
    taskCounts.map((t) => [t.launchId!, { total: Number(t.total), done: Number(t.done) }])
  )

  // Stats
  const totalLaunches = allLaunches.length
  const briefsReady = allPagers.filter((p) => p.pmmStatus === 'approved' || p.pmmStatus === 'pushed').length
  const inAutomation = allLaunches.filter((l) =>
    l.status === 'kick_off_automation' || l.status === 'processing'
  ).length

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">GTM Launch Overview & Tracking</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage course launches, one-pager briefs, and GTM task progress.
          </p>
        </div>
        <Link href="/launches/new" className="btn-primary flex items-center gap-1.5">
          <Plus className="w-4 h-4" />
          New Launch
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="card p-5">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Total Launches</p>
          <p className="text-3xl font-bold text-gray-900">{totalLaunches}</p>
        </div>
        <div className="card p-5">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Briefs Approved / Pushed</p>
          <p className="text-3xl font-bold text-green-600">{briefsReady}</p>
        </div>
        <div className="card p-5">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">In Automation</p>
          <p className="text-3xl font-bold text-blue-600">{inAutomation}</p>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-900">All Launches</h2>
        </div>

        {totalLaunches === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-sm">No launches yet. Create one to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Launch Name</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Brand</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">State</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Launch Date</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Brief</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tasks</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {allLaunches.map((launch) => {
                  const pager = pagerByLaunch[launch.id]
                  const pmmStatus = pager?.pmmStatus ?? '—'
                  const tasks = taskMap[launch.id]
                  const verticalStyle = launch.vertical
                    ? VERTICAL_STYLES[launch.vertical] ?? 'bg-gray-100 text-gray-600'
                    : null
                  const statusStyle = STATUS_STYLES[launch.status ?? 'draft'] ?? 'bg-gray-100 text-gray-600'
                  const pmmStyle = pager ? (PMM_STATUS_STYLES[pmmStatus] ?? 'bg-gray-100 text-gray-600') : null

                  return (
                    <tr key={launch.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-3">
                        <Link
                          href={pager?.launchId ? `/launches/${launch.id}/one-pager/edit` : `/launches/${launch.id}`}
                          className="text-indigo-600 font-medium hover:underline"
                        >
                          {launch.launchName}
                        </Link>
                        {launch.vertical && (
                          <span className={cn('badge ml-2 text-[10px]', verticalStyle)}>{launch.vertical}</span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-gray-600">{launch.brand || '—'}</td>
                      <td className="px-5 py-3 text-gray-600">{launch.state || '—'}</td>
                      <td className="px-5 py-3 text-gray-600">{formatDate(launch.hardLaunchDate)}</td>
                      <td className="px-5 py-3">
                        <span className={cn('badge', statusStyle)}>{launch.status ?? 'draft'}</span>
                      </td>
                      <td className="px-5 py-3">
                        {pmmStyle ? (
                          <span className={cn('badge', pmmStyle)}>{pmmStatus}</span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-gray-600">
                        {tasks ? (
                          <span className="text-xs">
                            {tasks.done}/{tasks.total}
                          </span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href={pager ? `/launches/${launch.id}/one-pager/edit` : `/launches/${launch.id}`}
                            className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </Link>
                          <DeleteLaunchButton launchId={launch.id} />
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
