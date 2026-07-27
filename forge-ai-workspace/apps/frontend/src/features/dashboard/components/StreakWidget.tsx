// File: apps/frontend/src/features/dashboard/components/StreakWidget.tsx
// Purpose: Productivity streak — consecutive days with a completed task

import { Flame } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@shared/components/ui/Card'
import { cn } from '@shared/lib/utils'

export function StreakWidget({ streak }: { streak: number }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Streak</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center gap-3">
        <Flame className={cn('h-8 w-8', streak > 0 ? 'text-warning' : 'text-muted-foreground')} />
        <div>
          <div className="text-2xl font-semibold">
            {streak} {streak === 1 ? 'day' : 'days'}
          </div>
          <p className="text-xs text-muted-foreground">
            {streak > 0 ? 'Keep completing tasks to extend it' : 'Complete a task to start a streak'}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
