// File: apps/frontend/src/features/tasks/hooks/useTasks.ts
// Purpose: Infinite task list query, keyed by active filters

import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { tasksApi, type TaskFilters } from '../api/tasks.api'

export const TASKS_QUERY_KEY = 'tasks'

// Shares the 'projects' root key so project mutations invalidate it too
export function useProjectOptions() {
  return useQuery({
    queryKey: ['projects', 'options'],
    queryFn: tasksApi.listProjectOptions,
    staleTime: 60_000,
  })
}

// Task detail — the only shape that includes the subtasks array
export function useTask(id: string | undefined) {
  return useQuery({
    queryKey: [TASKS_QUERY_KEY, 'detail', id],
    queryFn: () => tasksApi.get(id!),
    enabled: Boolean(id),
  })
}

export function useTasks(filters: TaskFilters) {
  return useInfiniteQuery({
    queryKey: [TASKS_QUERY_KEY, filters],
    queryFn: ({ pageParam }) => tasksApi.list(filters, pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.pagination.nextCursor ?? undefined,
  })
}
