// File: apps/backend/src/infrastructure/database/prisma.client.ts
// Purpose: Prisma client singleton — prevents multiple connections in development hot-reload

import { PrismaClient } from '@prisma/client'
import { logger } from '../../shared/logger'

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: [
      { emit: 'event', level: 'error' },
      { emit: 'event', level: 'warn' },
    ],
  })

prisma.$on('error', (e) => logger.error(e, 'Prisma error'))
prisma.$on('warn', (e) => logger.warn(e, 'Prisma warning'))

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
