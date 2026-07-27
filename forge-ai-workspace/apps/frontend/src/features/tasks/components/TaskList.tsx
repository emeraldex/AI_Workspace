// File: apps/frontend/src/features/tasks/components/TaskList.tsx
// Purpose: Task list with loading/error/empty states and cursor pagination

import { ListTodo, RefreshCw } from 'lucide-react'
import { Button } from '@shared/components/ui/Button'
import { Card, CardContent } from '@shared/components/ui/Card'
import { Skeleton } from '@shared/components/ui/Skeleton'
import { Spinner } from '@shared/components/ui/Spinner'
import { getApiErrorMessage } from '@shared/lib/apiError'
import { useTasks } from '../hooks/useTasks'
import { TaskCard } from './TaskCard'
import type { Task, TaskFilters } from '../api/tasks.api'

interface TaskListProps {
  filters: TaskFilters
  onEdit: (task: Task) => void
  onCreate: () => void
}

export function TaskList({ filters, onEdit, onCreate }: TaskListProps) {
  const { data, isPending, isError, error, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useTasks(filters)

  if (isPending) {
    return (
      <div className="flex flex-col gap-2">
        {Array.from({ length: 5 }, (_, i) => (
          <Skeleton key={i} className="h-[72px]" />
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
          <p className="text-sm text-muted-foreground">
            {getApiErrorMessage(error, 'Failed to load tasks')}
          </p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw />
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  const tasks = data.pages.flatMap((page) => page.data)
  const total = data.pages[0]?.pagination.total ?? 0

  if (tasks.length === 0) {
    const hasFilters = Boolean(filters.search || filters.status || filters.priority)
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
          <ListTodo className="h-10 w-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            {hasFilters ? 'No tasks match these filters.' : 'No tasks yet. Create your first one.'}
          </p>
          {!hasFilters && (
            <Button size="sm" onClick={onCreate}>
              New task
            </Button>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs text-muted-foreground">
        {tasks.length} of {total} task{total === 1 ? '' : 's'}
      </p>
      {tasks.map((task) => (
        <TaskCard key={task.id} task={task} onEdit={onEdit} />
      ))}
      {hasNextPage && (
        <Button
          variant="outline"
          className="mt-2 self-center"
          onClick={() => fetchNextPage()}
          disabled={isFetchingNextPage}
        >
          {isFetchingNextPage && <Spinner />}
          Load more
        </Button>
      )}
    </div>
  )
}
