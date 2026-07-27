// File: apps/backend/src/domains/notifications/notifications.service.ts
import { notificationsRepository } from './notifications.repository'
import { NotificationType } from '@prisma/client'

// Best-effort push to the user's connected sockets (Phase 8 §18).
// Lazy require avoids a hard dependency on socket initialization order.
function pushToSockets(userId: string, notification: unknown): void {
  try {
    const { getIO } = require('../../sockets/socket.server') as typeof import('../../sockets/socket.server')
    getIO().to(`user:${userId}`).emit('notification:new', notification)
  } catch {
    /* no socket server in this process */
  }
}

export const notificationsService = {
  async getAll(userId: string, filters: any) {
    const result = await notificationsRepository.findAll(userId, filters)
    return {
      data: result.notifications,
      pagination: { nextCursor: result.nextCursor, hasMore: result.hasMore, total: result.total },
    }
  },

  async create(userId: string, data: { type: NotificationType; title: string; body: string; metadata?: any }) {
    const notification = await notificationsRepository.create(userId, data)
    pushToSockets(userId, notification)
    return notification
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
