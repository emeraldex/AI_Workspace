// File: apps/backend/src/shared/middleware/authenticate.ts
// Purpose: JWT verification middleware — attaches req.user on success, throws AuthError on failure

import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { config } from '../config'
import { AuthError } from '../errors/AppError'

interface JwtPayload {
  sub: string
  email: string
  name: string
}

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization

  if (!authHeader?.startsWith('Bearer ')) {
    throw new AuthError('Authentication required')
  }

  const token = authHeader.slice(7)

  try {
    const payload = jwt.verify(token, config.jwt.secret) as JwtPayload
    req.user = { id: payload.sub, email: payload.email, name: payload.name }
    next()
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      throw new AuthError('Token expired')
    }
    throw new AuthError('Invalid token')
  }
}
