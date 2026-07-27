// File: apps/backend/src/infrastructure/database/prisma.client.ts
// Purpose: Prisma client singleton — prevents multiple connections in development hot-reload

import { PrismaClient } from '@prisma/client'
import { logger } from '../../shared/logger'

const createPrismaClient = () =>
  new PrismaClient({
    log: [
      { emit: 'event', level: 'error' },
      { emit: 'event', level: 'warn' },
    ],
  })

const globalForPrisma = globalThis as unknown as { prisma?: ReturnType<typeof createPrismaClient> }

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

prisma.$on('error', (e) => logger.error(e, 'Prisma error'))
prisma.$on('warn', (e) => logger.warn(e, 'Prisma warning'))

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
