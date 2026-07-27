// File: apps/frontend/src/features/tasks/components/TaskBoard.tsx
// Purpose: Kanban board view — status columns with native HTML5 drag-and-drop

import { useEffect, useState } from 'react'
import { useQueryClient, type InfiniteData } from '@tanstack/react-query'
import { ListChecks, RefreshCw } from 'lucide-react'
import { Badge } from '@shared/components/ui/Badge'
import { Button } from '@shared/components/ui/Button'
import { Card, CardContent } from '@shared/components/ui/Card'
import { Skeleton } from '@shared/components/ui/Skeleton'
import { getApiErrorMessage } from '@shared/lib/apiError'
import {
  PRIORITY_COLORS,
  PRIORITY_LABELS,
  STATUS_COLORS,
  STATUS_LABELS,
} from '@shared/lib/constants'
import { cn, formatDate } from '@shared/lib/utils'
import { TASKS_QUERY_KEY, useTasks } from '../hooks/useTasks'
import { useReorderTasks } from '../hooks/useTaskMutations'
import type { Task, TaskFilters, TaskPage, TaskStatus } from '../api/tasks.api'

// CANCELLED is deliberately excluded — cancelled tasks live in the list view only
const BOARD_COLUMNS = ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'] as const satisfies readonly TaskStatus[]
type BoardStatus = (typeof BOARD_COLUMNS)[number]

interface TaskBoardProps {
  filters: TaskFilters
  onEdit: (task: Task) => void
}

export function TaskBoard({ filters, onEdit }: TaskBoardProps) {
  const queryClient = useQueryClient()
  const reorderTasks = useReorderTasks()
  const { data, isPending, isError, error, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useTasks(filters)

  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [dragOverColumn, setDragOverColumn] = useState<BoardStatus | null>(null)

  // The board needs every task at once, so drain the cursor pagination eagerly
  useEffect(() => {
    if (hasNextPage && !isFetchingNextPage) void fetchNextPage()
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  if (isPending) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {BOARD_COLUMNS.map((status) => (
          <div key={status} className="flex flex-col gap-2">
            <Skeleton className="h-8" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </div>
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
  const columns = new Map<BoardStatus, Task[]>(BOARD_COLUMNS.map((status) => [status, []]))
  for (const task of tasks) {
    columns.get(task.status as BoardStatus)?.push(task)
  }
  for (const columnTasks of columns.values()) {
    columnTasks.sort((a, b) => a.sortOrder - b.sortOrder || a.createdAt.localeCompare(b.createdAt))
  }

  function handleDrop(targetStatus: BoardStatus, event: React.DragEvent) {
    event.preventDefault()
    setDragOverColumn(null)
    const id = draggingId ?? event.dataTransfer.getData('text/plain')
    setDraggingId(null)

    const task = tasks.find((t) => t.id === id)
    if (!task || task.status === targetStatus) return

    // Append to the end of the target column
    const sortOrder = columns.get(targetStatus)?.length ?? 0

    // Optimistic cache update; useReorderTasks invalidates on settle, which
    // rolls the move back on error and reconciles sort order on success.
    queryClient.setQueryData<InfiniteData<TaskPage>>([TASKS_QUERY_KEY, filters], (old) =>
      old
        ? {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              data: page.data.map((t) =>
                t.id === id ? { ...t, status: targetStatus, sortOrder } : t,
              ),
            })),
          }
        : old,
    )
    reorderTasks.mutate([{ id, sortOrder, status: targetStatus }])
  }

  return (
    <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-2 xl:grid-cols-4">
      {BOARD_COLUMNS.map((status) => {
        const columnTasks = columns.get(status) ?? []
        return (
          <div
            key={status}
            onDragOver={(e) => {
              e.preventDefault()
              e.dataTransfer.dropEffect = 'move'
              setDragOverColumn(status)
            }}
            onDragLeave={(e) => {
              // Only clear when leaving the column itself, not moving between children
              if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragOverColumn(null)
            }}
            onDrop={(e) => handleDrop(status, e)}
            aria-label={`${STATUS_LABELS[status]} column, ${columnTasks.length} tasks`}
            className={cn(
              'flex min-h-40 flex-col gap-2 rounded-lg border bg-muted/30 p-3 transition-colors',
              dragOverColumn === status && 'border-primary/60 ring-2 ring-primary/40',
            )}
          >
            <div className="flex items-center justify-between">
              <span
                className={cn(
                  'rounded px-1.5 py-0.5 text-xs font-medium',
                  STATUS_COLORS[status],
                )}
              >
                {STATUS_LABELS[status]}
              </span>
              <Badge variant="outline" className="text-xs text-muted-foreground">
                {columnTasks.length}
              </Badge>
            </div>

            {columnTasks.length === 0 && (
              <p className="py-6 text-center text-xs text-muted-foreground">No tasks</p>
            )}

            {columnTasks.map((task) => (
              <BoardCard
                key={task.id}
                task={task}
                isDragging={draggingId === task.id}
                onEdit={onEdit}
                onDragStart={(e) => {
                  e.dataTransfer.setData('text/plain', task.id)
                  e.dataTransfer.effectAllowed = 'move'
                  setDraggingId(task.id)
                }}
                onDragEnd={() => {
                  setDraggingId(null)
                  setDragOverColumn(null)
                }}
              />
            ))}
          </div>
        )
      })}
    </div>
  )
}

interface BoardCardProps {
  task: Task
  isDragging: boolean
  onEdit: (task: Task) => void
  onDragStart: (event: React.DragEvent) => void
  onDragEnd: () => void
}

function BoardCard({ task, isDragging, onEdit, onDragStart, onDragEnd }: BoardCardProps) {
  const isOverdue =
    task.status !== 'DONE' && task.dueDate != null && new Date(task.dueDate) < new Date()

  return (
    <div
      role="button"
      tabIndex={0}
      draggable
      aria-grabbed={isDragging}
      aria-label={`${task.title}, ${PRIORITY_LABELS[task.priority]} priority. Press Enter to edit.`}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={() => onEdit(task)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onEdit(task)
        }
      }}
      className={cn(
        'flex cursor-grab flex-col gap-2 rounded-lg border bg-surface p-3 text-left transition-colors',
        'hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background',
        isDragging && 'opacity-50',
      )}
    >
      <p className="text-sm font-medium">{task.title}</p>
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <Badge className={cn('border', PRIORITY_COLORS[task.priority])} variant="outline">
          {PRIORITY_LABELS[task.priority]}
        </Badge>
        {task.dueDate && (
          <span className={cn(isOverdue && 'font-medium text-destructive')}>
            Due {formatDate(task.dueDate)}
          </span>
        )}
        {task.subtaskCount > 0 && (
          <span className="flex items-center gap-1">
            <ListChecks className="h-3 w-3" />
            {task.completedSubtaskCount}/{task.subtaskCount}
          </span>
        )}
      </div>
      {task.project && (
        <p className="truncate text-xs text-muted-foreground">{task.project.name}</p>
      )}
    </div>
  )
}
