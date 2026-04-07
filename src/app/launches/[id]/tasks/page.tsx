import { notFound } from 'next/navigation'
import { db } from '@/db'
import { launches, gtmTasks } from '@/db/schema'
import { eq } from 'drizzle-orm'
import {
  LAUNCH_PHASES,
  LAUNCH_PHASE_STYLES,
  TASK_STATUS_STYLES,
  WORK_SOURCE_STYLES,
  ASSIGNEE_COLORS,
} from '@/lib/constants'
import { cn, initials } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function LaunchTasksPage({ params }: { params: { id: string } }) {
  const [launch] = await db.select().from(launches).where(eq(launches.id, params.id))
  if (!launch) notFound()

  const tasks = await db
    .select()
    .from(gtmTasks)
    .where(eq(gtmTasks.launchId, params.id))

  const tasksByPhase = LAUNCH_PHASES.reduce((acc, phase) => {
    acc[phase] = tasks.filter((t) => t.launchPhase === phase)
    return acc
  }, {} as Record<string, typeof tasks>)

  return (
    <div className="p-6">
      <div className="mb-6">
        <p className="text-sm text-gray-500">{launch.launchName}</p>
        <h1 className="text-xl font-semibold text-gray-900">GTM Tasks</h1>
        <p className="text-sm text-gray-500 mt-0.5">{tasks.length} tasks across {LAUNCH_PHASES.length} phases</p>
      </div>

      <div className="space-y-6">
        {LAUNCH_PHASES.map((phase) => {
          const phaseTasks = tasksByPhase[phase] ?? []
          return (
            <div key={phase} className="card overflow-hidden">
              <div className="flex items-center gap-3 px-5 py-3 border-b border-gray-100 bg-gray-50">
                <span className={cn('badge', LAUNCH_PHASE_STYLES[phase])}>{phase}</span>
                <span className="text-sm text-gray-500">{phaseTasks.length} tasks</span>
              </div>

              {phaseTasks.length === 0 ? (
                <p className="px-5 py-4 text-sm text-gray-400">No tasks in this phase.</p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left px-5 py-2.5 text-gray-500 font-medium">Task</th>
                      <th className="text-left px-4 py-2.5 text-gray-500 font-medium">Assignee</th>
                      <th className="text-left px-4 py-2.5 text-gray-500 font-medium">Work Source</th>
                      <th className="text-left px-4 py-2.5 text-gray-500 font-medium">Status</th>
                      <th className="text-left px-4 py-2.5 text-gray-500 font-medium">Dependencies</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {phaseTasks.map((task) => {
                      const color = task.assignee ? ASSIGNEE_COLORS[task.assignee] ?? 'bg-gray-400' : null
                      const deps = task.dependencies?.filter(Boolean) ?? []

                      return (
                        <tr key={task.id} className="hover:bg-gray-50">
                          <td className="px-5 py-2.5 font-medium text-gray-900">{task.name}</td>
                          <td className="px-4 py-2.5">
                            {task.assignee ? (
                              <div className="flex items-center gap-2">
                                <div className={cn('w-6 h-6 rounded-full text-white text-[10px] font-bold flex items-center justify-center shrink-0', color)}>
                                  {initials(task.assignee)}
                                </div>
                                <span className="text-gray-700 text-xs">{task.assignee}</span>
                              </div>
                            ) : <span className="text-gray-400">—</span>}
                          </td>
                          <td className="px-4 py-2.5">
                            {task.workSourceType ? (
                              <span className={cn('badge text-[11px]', WORK_SOURCE_STYLES[task.workSourceType] ?? 'bg-gray-100 text-gray-600')}>
                                {task.workSourceType}
                              </span>
                            ) : <span className="text-gray-400">—</span>}
                          </td>
                          <td className="px-4 py-2.5">
                            <span className={cn('badge', TASK_STATUS_STYLES[task.status ?? ''] ?? 'bg-gray-100 text-gray-600')}>
                              {task.status ?? 'Backlog'}
                            </span>
                          </td>
                          <td className="px-4 py-2.5 text-xs text-gray-500">
                            {deps.length > 0
                              ? deps.length === 1
                                ? `Blocked by ${deps[0]}`
                                : `${deps.length} dependencies`
                              : <span className="text-gray-400">None</span>}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
