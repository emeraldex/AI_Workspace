// File: apps/frontend/src/features/snippets/hooks/useSnippets.ts
// Purpose: Snippet list query (infinite, filter-keyed) and CRUD mutations

import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  snippetsApi,
  type CreateSnippetInput,
  type SnippetFilters,
  type UpdateSnippetInput,
} from '../api/snippets.api'

export const SNIPPETS_QUERY_KEY = 'snippets'

export function useSnippets(filters: SnippetFilters) {
  return useInfiniteQuery({
    queryKey: [SNIPPETS_QUERY_KEY, filters],
    queryFn: ({ pageParam }) => snippetsApi.list(filters, pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.pagination.nextCursor ?? undefined,
  })
}

function useInvalidateSnippets() {
  const queryClient = useQueryClient()
  return () => void queryClient.invalidateQueries({ queryKey: [SNIPPETS_QUERY_KEY] })
}

export function useCreateSnippet() {
  const invalidate = useInvalidateSnippets()
  return useMutation({
    mutationFn: (body: CreateSnippetInput) => snippetsApi.create(body),
    onSuccess: invalidate,
  })
}

export function useUpdateSnippet() {
  const invalidate = useInvalidateSnippets()
  return useMutation({
    mutationFn: ({ id, ...body }: UpdateSnippetInput & { id: string }) =>
      snippetsApi.update(id, body),
    onSuccess: invalidate,
  })
}

export function useDeleteSnippet() {
  const invalidate = useInvalidateSnippets()
  return useMutation({
    mutationFn: (id: string) => snippetsApi.remove(id),
    onSuccess: invalidate,
  })
}
