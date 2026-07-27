// File: apps/frontend/src/features/tasks/components/SubtaskList.tsx
// Purpose: Subtask checklist inside the task edit dialog — toggle, add,
//          inline rename, delete, with a completion progress bar

import { useState } from 'react'
import { Check, Plus, Trash2, X } from 'lucide-react'
import { Button } from '@shared/components/ui/Button'
import { Input } from '@shared/components/ui/Input'
import { Skeleton } from '@shared/components/ui/Skeleton'
import { cn } from '@shared/lib/utils'
import { useTask } from '../hooks/useTasks'
import { useCreateSubtask, useDeleteSubtask, useUpdateSubtask } from '../hooks/useTaskMutations'
import type { Subtask } from '../api/tasks.api'

function SubtaskRow({ taskId, subtask }: { taskId: string; subtask: Subtask }) {
  const updateSubtask = useUpdateSubtask(taskId)
  const deleteSubtask = useDeleteSubtask(taskId)
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(subtask.title)

  function commitRename() {
    const trimmed = title.trim()
    if (trimmed && trimmed !== subtask.title) {
      updateSubtask.mutate({ subtaskId: subtask.id, title: trimmed })
    }
    setEditing(false)
  }

  return (
    <li className="group flex items-center gap-2">
      <button
        type="button"
        onClick={() =>
          updateSubtask.mutate({ subtaskId: subtask.id, isCompleted: !subtask.isCompleted })
        }
        disabled={updateSubtask.isPending}
        aria-label={subtask.isCompleted ? 'Mark subtask as not done' : 'Mark subtask as done'}
        className={cn(
          'flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background',
          subtask.isCompleted
            ? 'border-success bg-success text-success-foreground'
            : 'border-input hover:border-success',
        )}
      >
        {subtask.isCompleted && <Check className="h-3 w-3" />}
      </button>

      {editing ? (
        <form
          className="flex-1"
          onSubmit={(e) => {
            e.preventDefault()
            commitRename()
          }}
        >
          <Input
            autoFocus
            className="h-7 text-sm"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={commitRename}
            onKeyDown={(e) => e.key === 'Escape' && setEditing(false)}
          />
        </form>
      ) : (
        <button
          type="button"
          className={cn(
            'min-w-0 flex-1 truncate text-left text-sm',
            subtask.isCompleted && 'text-muted-foreground line-through',
          )}
          onClick={() => {
            setTitle(subtask.title)
            setEditing(true)
          }}
          title="Click to rename"
        >
          {subtask.title}
        </button>
      )}

      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-6 w-6 shrink-0 opacity-0 hover:text-destructive group-hover:opacity-100"
        aria-label={`Delete subtask ${subtask.title}`}
        onClick={() => deleteSubtask.mutate(subtask.id)}
        disabled={deleteSubtask.isPending}
      >
        <Trash2 className="!h-3 !w-3" />
      </Button>
    </li>
  )
}

export function SubtaskList({ taskId }: { taskId: string }) {
  const { data: task, isPending } = useTask(taskId)
  const createSubtask = useCreateSubtask(taskId)
  const [adding, setAdding] = useState(false)
  const [newTitle, setNewTitle] = useState('')

  const subtasks = [...(task?.subtasks ?? [])].sort(
    (a, b) => a.sortOrder - b.sortOrder || a.title.localeCompare(b.title),
  )
  const done = subtasks.filter((s) => s.isCompleted).length

  function commitCreate() {
    const trimmed = newTitle.trim()
    if (trimmed) {
      createSubtask.mutate(trimmed, { onSuccess: () => setNewTitle('') })
    } else {
      setAdding(false)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Subtasks</span>
        {subtasks.length > 0 && (
          <span className="text-xs text-muted-foreground">
            {done}/{subtasks.length}
          </span>
        )}
      </div>

      {subtasks.length > 0 && (
        <div className="h-1 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-success transition-all"
            style={{ width: `${(done / subtasks.length) * 100}%` }}
          />
        </div>
      )}

      {isPending ? (
        <Skeleton className="h-6" />
      ) : (
        <ul className="flex flex-col gap-1.5">
          {subtasks.map((subtask) => (
            <SubtaskRow key={subtask.id} taskId={taskId} subtask={subtask} />
          ))}
        </ul>
      )}

      {adding ? (
        <form
          className="flex items-center gap-1.5"
          onSubmit={(e) => {
            e.preventDefault()
            commitCreate()
          }}
        >
          <Input
            autoFocus
            className="h-7 text-sm"
            placeholder="Subtask title"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Escape' && setAdding(false)}
          />
          <Button
            type="submit"
            size="sm"
            className="h-7"
            disabled={createSubtask.isPending || !newTitle.trim()}
          >
            Add
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            aria-label="Stop adding subtasks"
            onClick={() => setAdding(false)}
          >
            <X className="!h-3.5 !w-3.5" />
          </Button>
        </form>
      ) : (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 self-start px-2 text-muted-foreground"
          onClick={() => {
            setNewTitle('')
            setAdding(true)
          }}
        >
          <Plus />
          Add subtask
        </Button>
      )}
    </div>
  )
}
