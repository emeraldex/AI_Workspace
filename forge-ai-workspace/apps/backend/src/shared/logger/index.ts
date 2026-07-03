// File: apps/backend/src/shared/logger/index.ts
// Purpose: Pino logger singleton — structured JSON logging with request context support

import pino from 'pino'
import { config } from '../config'

export const logger = pino({
  level: config.isProduction ? 'info' : 'debug',
  ...(config.isProduction
    ? {}
    : {
        transport: {
          target: 'pino-pretty',
          options: { colorize: true, translateTime: 'SYS:standard', ignore: 'pid,hostname' },
        },
      }),
})
