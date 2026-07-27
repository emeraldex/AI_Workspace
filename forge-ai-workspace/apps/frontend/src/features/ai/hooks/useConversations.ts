// File: apps/frontend/src/features/ai/hooks/useConversations.ts
// Purpose: Conversation list/detail queries and mutations

import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { conversationsApi, type ConversationDetail } from '../api/conversations.api'

export const CONVERSATIONS_QUERY_KEY = 'conversations'

export function useConversations() {
  return useInfiniteQuery({
    queryKey: [CONVERSATIONS_QUERY_KEY, 'list'],
    queryFn: ({ pageParam }) => conversationsApi.list(pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.pagination.nextCursor ?? undefined,
  })
}

export function useConversation(id: string | undefined) {
  return useQuery({
    queryKey: [CONVERSATIONS_QUERY_KEY, 'detail', id],
    queryFn: () => conversationsApi.get(id!),
    enabled: Boolean(id),
  })
}

function useInvalidateConversationList() {
  const queryClient = useQueryClient()
  return () => {
    void queryClient.invalidateQueries({ queryKey: [CONVERSATIONS_QUERY_KEY, 'list'] })
    void queryClient.invalidateQueries({ queryKey: ['dashboard'] })
  }
}

export function useCreateConversation() {
  const queryClient = useQueryClient()
  const invalidate = useInvalidateConversationList()
  return useMutation({
    mutationFn: (title?: string) => conversationsApi.create(title),
    onSuccess: (conv) => {
      queryClient.setQueryData([CONVERSATIONS_QUERY_KEY, 'detail', conv.id], conv)
      invalidate()
    },
  })
}

export function useDeleteConversation() {
  const invalidate = useInvalidateConversationList()
  return useMutation({
    mutationFn: (id: string) => conversationsApi.remove(id),
    onSuccess: invalidate,
  })
}

export function useRenameConversation() {
  const queryClient = useQueryClient()
  const invalidate = useInvalidateConversationList()
  return useMutation({
    mutationFn: ({ id, title }: { id: string; title: string }) =>
      conversationsApi.rename(id, title),
    onSuccess: (_, { id, title }) => {
      queryClient.setQueryData<ConversationDetail>(
        [CONVERSATIONS_QUERY_KEY, 'detail', id],
        (prev) => (prev ? { ...prev, title } : prev),
      )
      invalidate()
    },
  })
}

export function useSendMessage(conversationId: string) {
  const queryClient = useQueryClient()
  const invalidate = useInvalidateConversationList()
  return useMutation({
    mutationFn: ({ content, documentIds }: { content: string; documentIds?: string[] }) =>
      conversationsApi.sendMessage(conversationId, content, documentIds),
    onSuccess: ({ userMessage }) => {
      // Show the user's message instantly; the AI reply arrives via socket
      queryClient.setQueryData<ConversationDetail>(
        [CONVERSATIONS_QUERY_KEY, 'detail', conversationId],
        (prev) => (prev ? { ...prev, messages: [...prev.messages, userMessage] } : prev),
      )
      invalidate()
    },
  })
}
