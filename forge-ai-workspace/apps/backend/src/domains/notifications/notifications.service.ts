// File: apps/backend/src/domains/notifications/notifications.service.ts
import { notificationsRepository } from './notifications.repository'
import { NotificationType } from '@prisma/client'

export const notificationsService = {
  async getAll(userId: string, filters: any) {
    const result = await notificationsRepository.findAll(userId, filters)
    return {
      data: result.notifications,
      pagination: { nextCursor: result.nextCursor, hasMore: result.hasMore, total: result.total },
    }
  },

  async create(userId: string, data: { type: NotificationType; title: string; body: string; metadata?: any }) {
    return notificationsRepository.create(userId, data)
  },

  async markRead(id: string, userId: string) {
    await notificationsRepository.markRead(id, userId)
    return { isRead: true }
  },

  async markAllRead(userId: string) {
    const result = await notificationsRepository.markAllRead(userId)
    return { updated: result.count }
  },

  async delete(id: string, userId: string) {
    await notificationsRepository.delete(id, userId)
  },
}
