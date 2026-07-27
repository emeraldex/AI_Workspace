// File: apps/frontend/src/features/documents/hooks/useDocuments.ts
// Purpose: Document/collection queries and mutations

import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  documentsApi,
  type CreateDocumentInput,
  type DocumentFilters,
  type UpdateDocumentInput,
} from '../api/documents.api'

export const DOCUMENTS_QUERY_KEY = 'documents'
export const COLLECTIONS_QUERY_KEY = 'collections'

export function useDocuments(filters: DocumentFilters) {
  return useInfiniteQuery({
    queryKey: [DOCUMENTS_QUERY_KEY, 'list', filters],
    queryFn: ({ pageParam }) => documentsApi.list(filters, pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.pagination.nextCursor ?? undefined,
  })
}

export function useDocument(id: string | undefined) {
  return useQuery({
    queryKey: [DOCUMENTS_QUERY_KEY, 'detail', id],
    queryFn: () => documentsApi.get(id!),
    enabled: Boolean(id),
  })
}

function useInvalidateDocumentLists() {
  const queryClient = useQueryClient()
  return () => {
    void queryClient.invalidateQueries({ queryKey: [DOCUMENTS_QUERY_KEY, 'list'] })
    void queryClient.invalidateQueries({ queryKey: ['dashboard'] })
  }
}

export function useCreateDocument() {
  const queryClient = useQueryClient()
  const invalidate = useInvalidateDocumentLists()
  return useMutation({
    mutationFn: (body: CreateDocumentInput) => documentsApi.create(body),
    onSuccess: (doc) => {
      queryClient.setQueryData([DOCUMENTS_QUERY_KEY, 'detail', doc.id], doc)
      invalidate()
    },
  })
}

// Silent save used by the editor's autosave — does NOT invalidate the detail
// query (the editor owns the current text; refetching would clobber typing).
export function useUpdateDocument() {
  const invalidate = useInvalidateDocumentLists()
  return useMutation({
    mutationFn: ({ id, ...body }: UpdateDocumentInput & { id: string }) =>
      documentsApi.update(id, body),
    onSuccess: invalidate,
  })
}

export function useDeleteDocument() {
  const invalidate = useInvalidateDocumentLists()
  return useMutation({
    mutationFn: (id: string) => documentsApi.remove(id),
    onSuccess: invalidate,
  })
}

export function useCollections() {
  return useQuery({ queryKey: [COLLECTIONS_QUERY_KEY], queryFn: documentsApi.listCollections })
}

function useInvalidateCollections() {
  const queryClient = useQueryClient()
  return () => {
    void queryClient.invalidateQueries({ queryKey: [COLLECTIONS_QUERY_KEY] })
    // Deleting a collection detaches its documents
    void queryClient.invalidateQueries({ queryKey: [DOCUMENTS_QUERY_KEY, 'list'] })
  }
}

export function useCreateCollection() {
  const invalidate = useInvalidateCollections()
  return useMutation({
    mutationFn: (body: { name: string; parentId?: string }) => documentsApi.createCollection(body),
    onSuccess: invalidate,
  })
}

export function useRenameCollection() {
  const invalidate = useInvalidateCollections()
  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) =>
      documentsApi.renameCollection(id, name),
    onSuccess: invalidate,
  })
}

export function useDeleteCollection() {
  const invalidate = useInvalidateCollections()
  return useMutation({
    mutationFn: (id: string) => documentsApi.removeCollection(id),
    onSuccess: invalidate,
  })
}
