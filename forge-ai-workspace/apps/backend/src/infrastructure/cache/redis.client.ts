// File: apps/backend/src/infrastructure/cache/redis.client.ts
// Purpose: ioredis singleton used for caching and Bull job queues

import Redis from 'ioredis'
import { config } from '../../shared/config'
import { logger } from '../../shared/logger'

export const redis = new Redis(config.redisUrl, {
  maxRetriesPerRequest: null, // required by BullMQ/Bull
  enableReadyCheck: false,
})

redis.on('connect', () => logger.info('Redis connected'))
redis.on('error', (err) => logger.error({ err }, 'Redis error'))
