// File: apps/backend/src/domains/projects/projects.validator.ts
import { z } from 'zod'

export const createProjectSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  icon: z.string().optional(),
})

export const updateProjectSchema = createProjectSchema.partial()

export const projectQuerySchema = z.object({
  includeArchived: z.coerce.boolean().default(false),
})
