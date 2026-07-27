// File: apps/frontend/src/features/notifications/hooks/useNotifications.ts
// Purpose: Notification queries/mutations + live notification:new handling

import { useEffect } from 'react'
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { useSocket } from '@shared/hooks/useSocket'
import { notificationsApi } from '../api/notifications.api'

export const NOTIFICATIONS_QUERY_KEY = 'notifications'

export function useNotifications(enabled: boolean) {
  return useInfiniteQuery({
    queryKey: [NOTIFICATIONS_QUERY_KEY, 'list'],
    queryFn: ({ pageParam }) => notificationsApi.list(false, pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.pagination.nextCursor ?? undefined,
    enabled,
  })
}

export function useUnreadCount() {
  return useQuery({
    queryKey: [NOTIFICATIONS_QUERY_KEY, 'unread-count'],
    queryFn: notificationsApi.unreadCount,
    staleTime: 30_000,
  })
}

function useInvalidateNotifications() {
  const queryClient = useQueryClient()
  return () => void queryClient.invalidateQueries({ queryKey: [NOTIFICATIONS_QUERY_KEY] })
}

/** Keeps badge and list fresh as notification:new events arrive */
export function useLiveNotifications() {
  const socket = useSocket()
  const invalidate = useInvalidateNotifications()

  useEffect(() => {
    socket.on('notification:new', invalidate)
    return () => {
      socket.off('notification:new', invalidate)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket])
}

export function useMarkRead() {
  const invalidate = useInvalidateNotifications()
  return useMutation({ mutationFn: notificationsApi.markRead, onSuccess: invalidate })
}

export function useMarkAllRead() {
  const invalidate = useInvalidateNotifications()
  return useMutation({ mutationFn: notificationsApi.markAllRead, onSuccess: invalidate })
}

export function useDeleteNotification() {
  const invalidate = useInvalidateNotifications()
  return useMutation({ mutationFn: notificationsApi.remove, onSuccess: invalidate })
}
