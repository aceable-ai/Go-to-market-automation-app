import Link from 'next/link'
import { db } from '@/db'
import { gtmTasks } from '@/db/schema'
import { LAUNCH_PHASES, LAUNCH_PHASE_STYLES, TASK_STATUS_STYLES, WORK_SOURCE_STYLES, ASSIGNEE_COLORS } from '@/lib/constants'
import { cn, initials } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function TaskDashboardPage() {
  const tasks = await db.select().from(gtmTasks)

  // Count by phase
  const phaseCounts = LAUNCH_PHASES.reduce((acc, phase) => {
    acc[phase] = tasks.filter((t) => t.launchPhase === phase).length
    return acc
  }, {} as Record<string, number>)

  const maxCount = Math.max(...Object.values(phaseCounts), 1)
  const total = tasks.length

  // Pivot: phase × status
  const allStatuses = ['Backlog', 'In Progress', 'Done', 'Blocked']
  const pivot = LAUNCH_PHASES.map((phase) => {
    const row: Record<string, number> = {}
    for (const status of allStatuses) {
      row[status] = tasks.filter((t) => t.launchPhase === phase && t.status === status).length
    }
    const total = tasks.filter((t) => t.launchPhase === phase).length
    return { phase, total, ...row }
  })

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Task Dashboard</h1>
        <Link href="/tasks/all" className="text-sm text-[#2D1169] hover:underline">
          View all tasks →
        </Link>
      </div>

      {/* Total count */}
      <div className="card p-4">
        <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Count</p>
        <p className="text-4xl font-bold text-gray-900 mt-1">{total}</p>
      </div>

      {/* Bar chart */}
      <div className="card p-5">
        <h2 className="text-sm font-medium text-gray-700 mb-4">Tasks by Launch Phase</h2>
        <div className="flex items-end gap-6 h-40">
          {LAUNCH_PHASES.map((phase) => {
            const count = phaseCounts[phase] ?? 0
            const heightPct = maxCount > 0 ? (count / maxCount) * 100 : 0
            return (
              <div key={phase} className="flex-1 flex flex-col items-center gap-1.5">
                <span className="text-xs text-gray-500 font-medium">{count}</span>
                <div
                  className="w-full bg-blue-500 rounded-t-sm transition-all"
                  style={{ height: `${Math.max(heightPct, 4)}%` }}
                />
                <span className="text-xs text-gray-500 text-center leading-tight">
                  {phase.replace(' ', '\n')}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Pivot table */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
          <h2 className="text-sm font-medium text-gray-700">Pivot table</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left px-5 py-2.5 text-gray-500 font-medium w-48">
                Launch Phase, Status
              </th>
              {allStatuses.map((s) => (
                <th key={s} className="px-4 py-2.5 text-right">
                  <span className={cn('badge', TASK_STATUS_STYLES[s] ?? 'bg-gray-100 text-gray-600')}>
                    {s}
                  </span>
                </th>
              ))}
              <th className="px-5 py-2.5 text-right font-semibold text-gray-700">Total</th>
            </tr>
          </thead>
          <tbody>
            {pivot.map(({ phase, total: rowTotal, ...counts }) => (
              <tr key={phase} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="px-5 py-2.5">
                  <span className={cn('badge', LAUNCH_PHASE_STYLES[phase])}>{phase}</span>
                </td>
                {allStatuses.map((s) => (
                  <td key={s} className="px-4 py-2.5 text-right text-gray-600">
                    {(counts as Record<string, number>)[s] ?? 0}
                  </td>
                ))}
                <td className="px-5 py-2.5 text-right font-semibold text-gray-900">{rowTotal}</td>
              </tr>
            ))}
            <tr className="bg-gray-50">
              <td className="px-5 py-2.5 font-semibold text-gray-900">Total</td>
              {allStatuses.map((s) => (
                <td key={s} className="px-4 py-2.5 text-right font-semibold text-gray-700">
                  {tasks.filter((t) => t.status === s).length}
                </td>
              ))}
              <td className="px-5 py-2.5 text-right font-bold text-gray-900">{total}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
