// File: apps/frontend/src/features/tasks/components/TaskForm.tsx
// Purpose: Create/edit task dialog — shared form for both modes

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@shared/components/ui/Dialog'
import { Button } from '@shared/components/ui/Button'
import { Input } from '@shared/components/ui/Input'
import { Label } from '@shared/components/ui/Label'
import { Select } from '@shared/components/ui/Select'
import { Spinner } from '@shared/components/ui/Spinner'
import { Textarea } from '@shared/components/ui/Textarea'
import { STATUS_LABELS, PRIORITY_LABELS } from '@shared/lib/constants'
import { getApiErrorMessage } from '@shared/lib/apiError'
import { useCreateTask, useUpdateTask } from '../hooks/useTaskMutations'
import { useProjectOptions } from '../hooks/useTasks'
import type { Task, TaskPriority, TaskStatus } from '../api/tasks.api'

interface TaskFormValues {
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  dueDate: string
  projectId: string
}

interface TaskFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Task to edit; omit to create */
  task?: Task | null
}

function toFormValues(task?: Task | null): TaskFormValues {
  return {
    title: task?.title ?? '',
    description: task?.description ?? '',
    status: task?.status ?? 'TODO',
    priority: task?.priority ?? 'MEDIUM',
    dueDate: task?.dueDate ? task.dueDate.slice(0, 10) : '',
    projectId: task?.project?.id ?? '',
  }
}

export function TaskForm({ open, onOpenChange, task }: TaskFormProps) {
  const isEdit = task != null
  const createTask = useCreateTask()
  const updateTask = useUpdateTask()
  const mutation = isEdit ? updateTask : createTask
  const { data: projectOptions } = useProjectOptions()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TaskFormValues>({ defaultValues: toFormValues(task) })

  // Re-seed the form whenever the dialog opens for a different task
  useEffect(() => {
    if (open) reset(toFormValues(task))
  }, [open, task, reset])

  function onSubmit(values: TaskFormValues) {
    const base = {
      title: values.title,
      description: values.description || undefined,
      status: values.status,
      priority: values.priority,
    }
    const options = { onSuccess: () => onOpenChange(false) }
    if (task) {
      // On update, empty selections send null to clear the field
      updateTask.mutate(
        {
          id: task.id,
          ...base,
          dueDate: values.dueDate || null,
          projectId: values.projectId || null,
        },
        options,
      )
    } else {
      createTask.mutate(
        {
          ...base,
          dueDate: values.dueDate || undefined,
          projectId: values.projectId || undefined,
        },
        options,
      )
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit task' : 'New task'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3" noValidate>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="task-title">Title</Label>
            <Input
              id="task-title"
              placeholder="What needs doing?"
              {...register('title', { required: 'Title is required', maxLength: 500 })}
            />
            {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="task-description">Description</Label>
            <Textarea id="task-description" placeholder="Optional details" {...register('description')} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="task-status">Status</Label>
              <Select id="task-status" {...register('status')}>
                {(Object.keys(STATUS_LABELS) as TaskStatus[]).map((status) => (
                  <option key={status} value={status}>
                    {STATUS_LABELS[status]}
                  </option>
                ))}
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="task-priority">Priority</Label>
              <Select id="task-priority" {...register('priority')}>
                {(Object.keys(PRIORITY_LABELS) as TaskPriority[]).map((priority) => (
                  <option key={priority} value={priority}>
                    {PRIORITY_LABELS[priority]}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="task-due">Due date</Label>
              <Input id="task-due" type="date" {...register('dueDate')} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="task-project">Project</Label>
              <Select id="task-project" {...register('projectId')}>
                <option value="">No project</option>
                {(projectOptions ?? []).map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          {mutation.isError && (
            <p role="alert" className="text-xs text-destructive">
              {getApiErrorMessage(mutation.error, 'Could not save the task')}
            </p>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending && <Spinner />}
              {isEdit ? 'Save changes' : 'Create task'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
