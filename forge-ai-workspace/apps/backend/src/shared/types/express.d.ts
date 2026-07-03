// File: apps/backend/src/shared/types/express.d.ts
// Purpose: Augment Express Request with authenticated user context

import { User } from '@prisma/client'

declare global {
  namespace Express {
    interface Request {
      user?: Pick<User, 'id' | 'email' | 'name'>
      requestId?: string
    }
  }
}
