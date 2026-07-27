// File: apps/frontend/src/features/dashboard/components/TaskSummaryWidget.tsx
// Purpose: Task counts by status

import { Card, CardContent, CardHeader, CardTitle } from '@shared/components/ui/Card'
import { STATUS_COLORS, STATUS_LABELS } from '@shared/lib/constants'
import { cn } from '@shared/lib/utils'
import type { DashboardData } from '../api/dashboard.api'

const ROWS = [
  { key: 'todo', status: 'TODO' },
  { key: 'inProgress', status: 'IN_PROGRESS' },
  { key: 'inReview', status: 'IN_REVIEW' },
  { key: 'done', status: 'DONE' },
] as const

export function TaskSummaryWidget({ summary }: { summary: DashboardData['taskSummary'] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tasks</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-2">
        {ROWS.map(({ key, status }) => (
          <div key={key} className={cn('rounded-md px-3 py-2', STATUS_COLORS[status])}>
            <div className="text-lg font-semibold">{summary[key]}</div>
            <div className="text-xs opacity-80">{STATUS_LABELS[status]}</div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
