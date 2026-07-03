// File: apps/backend/src/shared/middleware/requestId.ts
// Purpose: Attach a unique UUID to every request for log correlation

import { Request, Response, NextFunction } from 'express'
import { v4 as uuidv4 } from 'uuid'

export function requestId(req: Request, _res: Response, next: NextFunction): void {
  req.requestId = uuidv4()
  next()
}
