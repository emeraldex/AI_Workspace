// File: apps/frontend/src/features/notifications/api/notifications.api.ts
// Purpose: Typed wrappers for /api/v1/notifications

import { apiClient } from '@shared/api/client'
import type { PaginatedResponse } from '@forge/shared'

export type NotificationType = 'TASK_DUE_SOON' | 'TASK_OVERDUE' | 'AI_TASK_CREATED' | 'SYSTEM'

export interface AppNotification {
  id: string
  type: NotificationType
  title: string
  body: string
  isRead: boolean
  metadata: Record<string, unknown> | null
  createdAt: string
}

export interface NotificationPage {
  data: AppNotification[]
  pagination: { nextCursor: string | null; hasMore: boolean; total: number }
}

export const notificationsApi = {
  async list(unreadOnly = false, cursor?: string, limit = 20): Promise<NotificationPage> {
    const params: Record<string, string | number> = { limit }
    if (unreadOnly) params.unreadOnly = 'true'
    if (cursor) params.cursor = cursor
    const { data } = await apiClient.get<PaginatedResponse<AppNotification>>('/notifications', {
      params,
    })
    return { data: data.data, pagination: data.pagination }
  },

  /** Unread total via the lightest possible query */
  async unreadCount(): Promise<number> {
    const page = await notificationsApi.list(true, undefined, 1)
    return page.pagination.total
  },

  async markRead(id: string): Promise<void> {
    await apiClient.patch(`/notifications/${id}/read`)
  },

  async markAllRead(): Promise<void> {
    await apiClient.patch('/notifications/read-all')
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/notifications/${id}`)
  },
}
