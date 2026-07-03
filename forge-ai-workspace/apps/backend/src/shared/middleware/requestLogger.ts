// File: apps/backend/src/shared/middleware/requestLogger.ts
// Purpose: Log every request and response with method, path, status, duration, requestId

import { Request, Response, NextFunction } from 'express'
import { logger } from '../logger'

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now()

  res.on('finish', () => {
    const duration = Date.now() - start
    const level = res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info'

    logger[level]({
      requestId: req.requestId,
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration,
      userId: req.user?.id,
    })
  })

  next()
}
