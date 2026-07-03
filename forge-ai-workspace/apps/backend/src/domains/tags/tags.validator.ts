// File: apps/backend/src/domains/tags/tags.validator.ts
import { z } from 'zod'

export const createTagSchema = z.object({
  name: z.string().min(1).max(50),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
})
