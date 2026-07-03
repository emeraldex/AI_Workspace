// File: apps/backend/src/shared/middleware/validate.ts
// Purpose: Zod request validation middleware factory.
//          Throws ValidationError with field-level errors on failure.

import { Request, Response, NextFunction } from 'express'
import { ZodSchema, ZodError } from 'zod'
import { ValidationError } from '../errors/AppError'

type RequestPart = 'body' | 'query' | 'params'

export function validate(schema: ZodSchema, part: RequestPart = 'body') {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[part])

    if (!result.success) {
      const errors = (result.error as ZodError).errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }))
      throw new ValidationError(errors)
    }

    req[part] = result.data
    next()
  }
}
