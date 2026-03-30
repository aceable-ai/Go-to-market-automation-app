import { notFound } from 'next/navigation'
import Link from 'next/link'
import { db } from '@/db'
import { launches, onePagers, gtmTasks } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { formatDate } from '@/lib/utils'
import { VERTICAL_STYLES, LAUNCH_PHASE_STYLES, TASK_STATUS_STYLES } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { FileText, ListChecks, ArrowRight } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function LaunchPage({ params }: { params: { id: string } }) {
  const [launch] = await db
    .select()
    .from(launches)
    .where(eq(launches.id, params.id))

  if (!launch) notFound()

  const tasks = await db
    .select()
    .from(gtmTasks)
    .where(eq(gtmTasks.launchId, params.id))

  const tasksByPhase = tasks.reduce((acc, t) => {
    const phase = t.launchPhase ?? 'Unphased'
    if (!acc[phase]) acc[phase] = []
    acc[phase].push(t)
    return acc
  }, {} as Record<string, typeof tasks>)

  const doneTasks = tasks.filter((t) => t.status === 'Done').length
  const totalTasks = tasks.length
  const pct = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0

  const verticalStyle = launch.vertical ? VERTICAL_STYLES[launch.vertical] ?? 'bg-gray-100 text-gray-600' : null

  return (
    <div className="p-6 max-w-4xl space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{launch.launchName}</h1>
            <div className="flex items-center gap-2 mt-1.5">
              {launch.brand && <span className="text-sm text-gray-500">{launch.brand}</span>}
              {launch.vertical && (
                <span className={cn('badge', verticalStyle)}>{launch.vertical}</span>
              )}
              {launch.status && (
                <span className="badge bg-purple-100 text-purple-700">{launch.status}</span>
              )}
            </div>
          </div>
          <Link href={`/launches/${params.id}/one-pager`} className="btn-primary flex items-center gap-1.5">
            <FileText className="w-4 h-4" />
            View One-Pager
          </Link>
        </div>
      </div>

      {/* Key details */}
      <div className="card p-5 grid grid-cols-3 gap-4">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">State</p>
          <p className="text-sm font-medium text-gray-900 mt-0.5">{launch.state ?? '—'}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Market Presence</p>
          <p className="text-sm font-medium text-gray-900 mt-0.5">{launch.marketPresence ?? '—'}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Regulatory Status</p>
          <p className="text-sm font-medium text-gray-900 mt-0.5">{launch.regulatoryStatus ?? '—'}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Hard Launch Date</p>
          <p className="text-sm font-medium text-gray-900 mt-0.5">{formatDate(launch.hardLaunchDate)}</p>
        </div>
        {launch.jiraKey && (
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Jira Ticket</p>
            <p className="text-sm font-medium text-gray-900 mt-0.5">{launch.jiraKey}</p>
          </div>
        )}
        {launch.stagingUrl && (
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Staging URL</p>
            <a href={launch.stagingUrl} className="text-sm text-[#2D1169] hover:underline mt-0.5 block truncate">
              {launch.stagingUrl}
            </a>
          </div>
        )}
      </div>

      {/* GTM task progress */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <ListChecks className="w-4 h-4" />
            GTM Tasks
          </h2>
          <span className="text-sm text-gray-500">{doneTasks}/{totalTasks} complete</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2 mb-4">
          <div
            className="bg-[#2D1169] h-2 rounded-full transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="space-y-3">
          {['Pre-Launch', 'Soft Launch', 'Hard Launch', 'Post-Launch'].map((phase) => {
            const phaseTasks = tasksByPhase[phase] ?? []
            if (phaseTasks.length === 0) return null
            return (
              <div key={phase}>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className={cn('badge text-[11px]', LAUNCH_PHASE_STYLES[phase])}>{phase}</span>
                  <span className="text-xs text-gray-400">{phaseTasks.filter(t => t.status === 'Done').length}/{phaseTasks.length}</span>
                </div>
                <div className="space-y-1">
                  {phaseTasks.slice(0, 4).map((t) => (
                    <div key={t.id} className="flex items-center justify-between text-xs text-gray-600 py-0.5">
                      <span className="truncate">{t.name}</span>
                      <span className={cn('badge ml-2 shrink-0', TASK_STATUS_STYLES[t.status ?? ''] ?? 'bg-gray-100 text-gray-600')}>
                        {t.status}
                      </span>
                    </div>
                  ))}
                  {phaseTasks.length > 4 && (
                    <p className="text-xs text-gray-400">+{phaseTasks.length - 4} more</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
        <Link href={`/launches/${params.id}/tasks`} className="flex items-center gap-1 text-xs text-[#2D1169] hover:underline mt-3">
          View all tasks <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  )
}
