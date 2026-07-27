// File: apps/backend/src/domains/search/search.validator.ts
import { z } from 'zod'

export const searchQuerySchema = z.object({
  q: z.string().min(1).max(200),
  types: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(20).default(5),
})

export const semanticQuerySchema = z.object({
  q: z.string().min(1).max(500),
  limit: z.coerce.number().int().min(1).max(10).default(5),
})
