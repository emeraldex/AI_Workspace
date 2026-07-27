// File: apps/frontend/src/features/dashboard/components/OverdueTasksWidget.tsx
// Purpose: Tasks needing attention — overdue and due-today lists

import { AlertTriangle, CalendarClock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@shared/components/ui/Card'
import { Badge } from '@shared/components/ui/Badge'
import { PRIORITY_COLORS, PRIORITY_LABELS } from '@shared/lib/constants'
import { cn, formatDate } from '@shared/lib/utils'
import type { DashboardTask } from '../api/dashboard.api'

function TaskRows({ tasks, emptyText }: { tasks: DashboardTask[]; emptyText: string }) {
  if (tasks.length === 0) {
    return <p className="py-2 text-xs text-muted-foreground">{emptyText}</p>
  }
  return (
    <ul className="flex flex-col gap-1.5">
      {tasks.map((task) => (
        <li key={task.id} className="flex items-center justify-between gap-2 rounded-md border px-3 py-2">
          <span className="min-w-0 flex-1 truncate text-sm">{task.title}</span>
          {task.dueDate && (
            <span className="shrink-0 text-xs text-muted-foreground">{formatDate(task.dueDate)}</span>
          )}
          <Badge className={cn('shrink-0 border', PRIORITY_COLORS[task.priority])} variant="outline">
            {PRIORITY_LABELS[task.priority]}
          </Badge>
        </li>
      ))}
    </ul>
  )
}

export function OverdueTasksWidget({
  todayTasks,
  overdueTasks,
}: {
  todayTasks: DashboardTask[]
  overdueTasks: DashboardTask[]
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarClock className="h-4 w-4 text-primary" />
          Needs attention
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div>
          <h4 className="mb-2 flex items-center gap-1.5 text-xs font-medium text-destructive">
            <AlertTriangle className="h-3.5 w-3.5" />
            Overdue
          </h4>
          <TaskRows tasks={overdueTasks} emptyText="Nothing overdue. Nice." />
        </div>
        <div>
          <h4 className="mb-2 text-xs font-medium text-muted-foreground">Due today</h4>
          <TaskRows tasks={todayTasks} emptyText="Nothing due today." />
        </div>
      </CardContent>
    </Card>
  )
}
