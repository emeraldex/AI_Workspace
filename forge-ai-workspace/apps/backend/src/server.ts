// File: apps/backend/src/server.ts
// Purpose: HTTP server entry point — binds port, handles graceful shutdown

import 'dotenv/config'
import http from 'node:http'
import { createApp } from './app'
import { config } from './shared/config'
import { logger } from './shared/logger'
import { prisma } from './infrastructure/database/prisma.client'
import { redis } from './infrastructure/cache/redis.client'
import { initSocketServer } from './sockets/socket.server'

const app = createApp()
const server = http.createServer(app)
initSocketServer(server)

server.listen(config.port, () => {
  logger.info(`🚀 Server running on port ${config.port} [${config.nodeEnv}]`)
})

async function shutdown(signal: string) {
  logger.info(`${signal} received — shutting down gracefully`)
  server.close(async () => {
    await prisma.$disconnect()
    redis.disconnect()
    logger.info('Server closed')
    process.exit(0)
  })
}

process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT', () => shutdown('SIGINT'))

process.on('unhandledRejection', (reason) => {
  logger.error({ reason }, 'Unhandled promise rejection')
})

process.on('uncaughtException', (err) => {
  logger.error({ err }, 'Uncaught exception — shutting down')
  process.exit(1)
})
