// File: apps/backend/src/shared/middleware/errorHandler.ts
// Purpose: Global error handler — maps AppError subclasses to HTTP responses.
//          Catches all unhandled errors; never exposes stack traces in production.

import { Request, Response, NextFunction } from 'express'
import { AppError } from '../errors/AppError'
import { logger } from '../logger'
import { config } from '../config'

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err.errors ? { errors: err.errors } : {}),
    })
    return
  }

  logger.error({
    requestId: req.requestId,
    userId: req.user?.id,
    err: { message: err.message, stack: err.stack },
  }, 'Unhandled error')

  res.status(500).json({
    success: false,
    message: config.isProduction ? 'Internal server error' : err.message,
  })
}
