// File: apps/backend/src/domains/notifications/notifications.repository.ts
import { prisma } from '../../infrastructure/database/prisma.client'
import { NotificationType } from '@prisma/client'

export const notificationsRepository = {
  async findAll(userId: string, filters: { unreadOnly?: boolean; cursor?: string; limit?: number }) {
    const limit = Math.min(filters.limit ?? 20, 100)
    const where: any = {
      userId,
      ...(filters.unreadOnly && { isRead: false }),
      ...(filters.cursor && { id: { lt: filters.cursor } }),
    }

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({ where, orderBy: { createdAt: 'desc' }, take: limit + 1 }),
      prisma.notification.count({ where }),
    ])

    const hasMore = notifications.length > limit
    if (hasMore) notifications.pop()
    return { notifications, total, hasMore, nextCursor: hasMore ? (notifications[notifications.length - 1]?.id ?? null) : null }
  },

  async create(userId: string, data: { type: NotificationType; title: string; body: string; metadata?: any }) {
    return prisma.notification.create({ data: { userId, ...data } })
  },

  async markRead(id: string, userId: string) {
    return prisma.notification.updateMany({ where: { id, userId }, data: { isRead: true } })
  },

  async markAllRead(userId: string) {
    return prisma.notification.updateMany({ where: { userId, isRead: false }, data: { isRead: true } })
  },

  async delete(id: string, userId: string) {
    return prisma.notification.deleteMany({ where: { id, userId } })
  },

  async getUnreadCount(userId: string) {
    return prisma.notification.count({ where: { userId, isRead: false } })
  },
}
