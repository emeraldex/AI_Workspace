// File: apps/backend/src/app.ts
// Purpose: Express application factory — all middleware and routes registered here.
//          Exported separately from server.ts to allow supertest to import without binding a port.

import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { config } from './shared/config'
import { requestId } from './shared/middleware/requestId'
import { requestLogger } from './shared/middleware/requestLogger'
import { errorHandler } from './shared/middleware/errorHandler'
import { generalRateLimiter } from './shared/middleware/rateLimiter'
import { authRouter } from './domains/auth/auth.router'
import { usersRouter } from './domains/users/users.router'
import { settingsRouter } from './domains/settings/settings.router'
import { dashboardRouter } from './domains/dashboard/dashboard.router'
import { projectsRouter } from './domains/projects/projects.router'
import { tasksRouter } from './domains/tasks/tasks.router'
import { tagsRouter } from './domains/tags/tags.router'
import { documentsRouter } from './domains/documents/documents.router'
import { collectionsRouter } from './domains/collections/collections.router'
import { snippetsRouter } from './domains/snippets/snippets.router'
import { notificationsRouter } from './domains/notifications/notifications.router'
import { conversationsRouter } from './domains/conversations/conversations.router'
import { searchRouter } from './domains/search/search.router'

export function createApp() {
  const app = express()

  // ── Security headers ───────────────────────────────────────────────────────
  app.use(helmet())

  // ── CORS ───────────────────────────────────────────────────────────────────
  app.use(
    cors({
      origin: config.corsOrigins,
      credentials: true,
    }),
  )

  // ── Body parsing ───────────────────────────────────────────────────────────
  app.use(express.json({ limit: '1mb' }))
  app.use(express.urlencoded({ extended: true }))
  app.use(cookieParser())

  // ── Request lifecycle ──────────────────────────────────────────────────────
  app.use(requestId)
  app.use(requestLogger)
  app.use(generalRateLimiter)

  // ── Health check ───────────────────────────────────────────────────────────
  app.get('/health', async (_req, res) => {
    let database = 'disconnected'
    let redisStatus = 'disconnected'
    try {
      const { prisma } = await import('./infrastructure/database/prisma.client')
      await prisma.$queryRaw`SELECT 1`
      database = 'connected'
    } catch {}
    try {
      const { redis } = await import('./infrastructure/cache/redis.client')
      await redis.ping()
      redisStatus = 'connected'
    } catch {}
    res.json({
      status: 'ok',
      uptime: Math.floor(process.uptime()),
      database,
      redis: redisStatus,
      timestamp: new Date().toISOString(),
    })
  })

  // ── API routes ─────────────────────────────────────────────────────────────
  app.use('/api/v1/auth', authRouter)
  app.use('/api/v1/users', usersRouter)
  app.use('/api/v1/settings', settingsRouter)
  app.use('/api/v1/dashboard', dashboardRouter)
  app.use('/api/v1/projects', projectsRouter)
  app.use('/api/v1/tasks', tasksRouter)
  app.use('/api/v1/tags', tagsRouter)
  app.use('/api/v1/documents', documentsRouter)
  app.use('/api/v1/collections', collectionsRouter)
  app.use('/api/v1/snippets', snippetsRouter)
  app.use('/api/v1/notifications', notificationsRouter)
  app.use('/api/v1/conversations', conversationsRouter)
  app.use('/api/v1/search', searchRouter)

  // ── 404 handler ────────────────────────────────────────────────────────────
  app.use((_req, res) => {
    res.status(404).json({ success: false, message: 'Route not found' })
  })

  // ── Global error handler (must be last) ────────────────────────────────────
  app.use(errorHandler)

  return app
}
