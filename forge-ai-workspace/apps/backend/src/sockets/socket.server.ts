// File: apps/backend/src/sockets/socket.server.ts
// Purpose: Socket.IO server — auth, user/conversation rooms (Phase 8 §18).
//          Exposes getIO() so HTTP-layer code can emit to rooms.

import type { Server as HttpServer } from 'node:http'
import { Server } from 'socket.io'
import { config } from '../shared/config'
import { logger } from '../shared/logger'
import { prisma } from '../infrastructure/database/prisma.client'
import { socketAuth } from './socket.auth'

let io: Server | null = null

export function initSocketServer(httpServer: HttpServer): Server {
  io = new Server(httpServer, {
    cors: { origin: config.corsOrigins, credentials: true },
  })

  io.use(socketAuth)

  io.on('connection', (socket) => {
    const userId = socket.data.userId as string
    void socket.join(`user:${userId}`)
    logger.debug({ userId, socketId: socket.id }, 'Socket connected')

    socket.on('conversation:join', async ({ conversationId }: { conversationId?: string }) => {
      if (typeof conversationId !== 'string') return
      // Ownership check — never let a client join another user's room
      const conv = await prisma.conversation.findFirst({
        where: { id: conversationId, userId, deletedAt: null },
        select: { id: true },
      })
      if (conv) void socket.join(`conversation:${conversationId}`)
    })

    socket.on('conversation:leave', ({ conversationId }: { conversationId?: string }) => {
      if (typeof conversationId !== 'string') return
      void socket.leave(`conversation:${conversationId}`)
    })

    socket.on('disconnect', () => {
      logger.debug({ userId, socketId: socket.id }, 'Socket disconnected')
    })
  })

  return io
}

export function getIO(): Server {
  if (!io) throw new Error('Socket server not initialized')
  return io
}
