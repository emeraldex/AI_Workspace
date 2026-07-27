// File: apps/frontend/src/features/tasks/components/TaskCard.tsx
// Purpose: Single task row — complete toggle, metadata badges, edit/delete actions

import { useState } from 'react'
import { Check, ListChecks, Pencil, Trash2 } from 'lucide-react'
import { Badge } from '@shared/components/ui/Badge'
import { Button } from '@shared/components/ui/Button'
import { ConfirmDialog } from '@shared/components/ui/ConfirmDialog'
import { PRIORITY_COLORS, PRIORITY_LABELS, STATUS_COLORS, STATUS_LABELS } from '@shared/lib/constants'
import { cn, formatDate } from '@shared/lib/utils'
import { useDeleteTask, useUpdateTask } from '../hooks/useTaskMutations'
import type { Task } from '../api/tasks.api'

interface TaskCardProps {
  task: Task
  onEdit: (task: Task) => void
}

export function TaskCard({ task, onEdit }: TaskCardProps) {
  const updateTask = useUpdateTask()
  const deleteTask = useDeleteTask()
  const [confirmOpen, setConfirmOpen] = useState(false)

  const isDone = task.status === 'DONE'
  const isOverdue =
    !isDone && task.status !== 'CANCELLED' && task.dueDate != null && new Date(task.dueDate) < new Date()

  function toggleDone() {
    updateTask.mutate({ id: task.id, status: isDone ? 'TODO' : 'DONE' })
  }

  return (
    <div className="flex items-center gap-3 rounded-lg border bg-surface p-4 transition-colors hover:border-primary/40">
      <button
        onClick={toggleDone}
        disabled={updateTask.isPending}
        aria-label={isDone ? 'Mark as not done' : 'Mark as done'}
        className={cn(
          'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background',
          isDone
            ? 'border-success bg-success text-success-foreground'
            : 'border-input hover:border-success',
        )}
      >
        {isDone && <Check className="h-3 w-3" />}
      </button>

      <div className="min-w-0 flex-1">
        <p className={cn('truncate text-sm font-medium', isDone && 'text-muted-foreground line-through')}>
          {task.title}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span className={cn('rounded px-1.5 py-0.5', STATUS_COLORS[task.status])}>
            {STATUS_LABELS[task.status]}
          </span>
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
          {task.project && <span>{task.project.name}</span>}
          {task.tags.map((tag) => (
            <span key={tag.id} className="rounded bg-muted px-1.5 py-0.5">
              {tag.name}
            </span>
          ))}
        </div>
      </div>

      <Badge className={cn('shrink-0 border', PRIORITY_COLORS[task.priority])} variant="outline">
        {PRIORITY_LABELS[task.priority]}
      </Badge>

      <div className="flex shrink-0 items-center">
        <Button variant="ghost" size="icon" onClick={() => onEdit(task)} aria-label="Edit task">
          <Pencil />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setConfirmOpen(true)}
          aria-label="Delete task"
          className="text-muted-foreground hover:text-destructive"
        >
          <Trash2 />
        </Button>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete task?"
        description={`"${task.title}" will be moved to trash.`}
        onConfirm={() =>
          deleteTask.mutate(task.id, { onSuccess: () => setConfirmOpen(false) })
        }
        isPending={deleteTask.isPending}
      />
    </div>
  )
}
