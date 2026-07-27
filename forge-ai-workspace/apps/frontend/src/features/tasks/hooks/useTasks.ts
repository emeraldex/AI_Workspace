// File: apps/frontend/src/features/tasks/hooks/useTasks.ts
// Purpose: Infinite task list query, keyed by active filters

import { useInfiniteQuery } from '@tanstack/react-query'
import { tasksApi, type TaskFilters } from '../api/tasks.api'

export const TASKS_QUERY_KEY = 'tasks'

export function useTasks(filters: TaskFilters) {
  return useInfiniteQuery({
    queryKey: [TASKS_QUERY_KEY, filters],
    queryFn: ({ pageParam }) => tasksApi.list(filters, pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.pagination.nextCursor ?? undefined,
  })
}
