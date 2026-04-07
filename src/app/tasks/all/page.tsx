import { db } from '@/db'
import { gtmTasks, launches } from '@/db/schema'
import { eq } from 'drizzle-orm'
import {
  TASK_STATUS_STYLES,
  LAUNCH_PHASE_STYLES,
  WORK_SOURCE_STYLES,
  ASSIGNEE_COLORS,
} from '@/lib/constants'
import { cn, initials } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function AllTasksPage() {
  const tasks = await db
    .select({
      id: gtmTasks.id,
      name: gtmTasks.name,
      assignee: gtmTasks.assignee,
      workSourceType: gtmTasks.workSourceType,
      status: gtmTasks.status,
      launchPhase: gtmTasks.launchPhase,
      dependencies: gtmTasks.dependencies,
      comments: gtmTasks.comments,
      launchId: gtmTasks.launchId,
    })
    .from(gtmTasks)
    .orderBy(gtmTasks.launchPhase, gtmTasks.name)

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-gray-900">GTM Task Tracking</h1>
        <span className="text-sm text-gray-500">{tasks.length} tasks</span>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left px-4 py-3 text-gray-600 font-medium">Name</th>
              <th className="text-left px-4 py-3 text-gray-600 font-medium">Assignee</th>
              <th className="text-left px-4 py-3 text-gray-600 font-medium">Work Source Type</th>
              <th className="text-left px-4 py-3 text-gray-600 font-medium">Phase</th>
              <th className="text-left px-4 py-3 text-gray-600 font-medium">Status</th>
              <th className="text-left px-4 py-3 text-gray-600 font-medium">Dependencies</th>
              <th className="text-left px-4 py-3 text-gray-600 font-medium">Comments</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {tasks.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                  No tasks yet. Create a launch to generate tasks automatically.
                </td>
              </tr>
            ) : (
              tasks.map((task) => {
                const assigneeColor = task.assignee
                  ? ASSIGNEE_COLORS[task.assignee] ?? 'bg-gray-400'
                  : null
                const deps = task.dependencies?.filter(Boolean) ?? []

                return (
                  <tr key={task.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900">{task.name}</td>
                    <td className="px-4 py-3">
                      {task.assignee ? (
                        <div className="flex items-center gap-2">
                          <div className={cn(
                            'w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0',
                            assigneeColor
                          )}>
                            {initials(task.assignee)}
                          </div>
                          <span className="text-gray-700">{task.assignee}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {task.workSourceType ? (
                        <span className={cn('badge', WORK_SOURCE_STYLES[task.workSourceType] ?? 'bg-gray-100 text-gray-600')}>
                          {task.workSourceType}
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {task.launchPhase ? (
                        <span className={cn('badge', LAUNCH_PHASE_STYLES[task.launchPhase] ?? 'bg-gray-100 text-gray-600')}>
                          {task.launchPhase}
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn('badge', TASK_STATUS_STYLES[task.status ?? ''] ?? 'bg-gray-100 text-gray-600')}>
                        {task.status ?? 'Backlog'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 max-w-[180px]">
                      {deps.length > 0 ? (
                        <span className="truncate block" title={deps.join(', ')}>
                          {deps.length === 1 ? `Blocked by ${deps[0]}` : `${deps.length} dependencies`}
                        </span>
                      ) : (
                        <span className="text-gray-400">None</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-400">
                      {task.comments ?? '—'}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
