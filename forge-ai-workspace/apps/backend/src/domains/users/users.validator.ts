// File: apps/backend/src/domains/users/users.validator.ts
import { z } from 'zod'

export const updateProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  avatarUrl: z.string().url().optional(),
  bio: z.string().max(500).optional(),
  timezone: z.string().min(1).optional(),
})
