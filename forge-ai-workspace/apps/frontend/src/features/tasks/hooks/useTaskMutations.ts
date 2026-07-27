// File: apps/frontend/src/features/tasks/hooks/useTaskMutations.ts
// Purpose: Create/update/delete task mutations — invalidate task list and dashboard

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { tasksApi, type CreateTaskInput, type ReorderUpdate, type UpdateTaskInput } from '../api/tasks.api'
import { TASKS_QUERY_KEY } from './useTasks'

function useInvalidateTasks() {
  const queryClient = useQueryClient()
  return () => {
    void queryClient.invalidateQueries({ queryKey: [TASKS_QUERY_KEY] })
    void queryClient.invalidateQueries({ queryKey: ['dashboard'] })
  }
}

export function useCreateTask() {
  const invalidate = useInvalidateTasks()
  return useMutation({
    mutationFn: (body: CreateTaskInput) => tasksApi.create(body),
    onSuccess: invalidate,
  })
}

export function useUpdateTask() {
  const invalidate = useInvalidateTasks()
  return useMutation({
    mutationFn: ({ id, ...body }: UpdateTaskInput & { id: string }) => tasksApi.update(id, body),
    onSuccess: invalidate,
  })
}

export function useDeleteTask() {
  const invalidate = useInvalidateTasks()
  return useMutation({
    mutationFn: (id: string) => tasksApi.remove(id),
    onSuccess: invalidate,
  })
}

/** Persist drag-and-drop moves. Callers apply the optimistic cache update
 *  themselves; invalidating on settle both confirms success and rolls back
 *  a failed move to server truth. */
export function useReorderTasks() {
  const invalidate = useInvalidateTasks()
  return useMutation({
    mutationFn: (updates: ReorderUpdate[]) => tasksApi.reorder(updates),
    onSettled: invalidate,
  })
}
