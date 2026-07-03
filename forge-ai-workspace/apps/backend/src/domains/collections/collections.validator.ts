// File: apps/backend/src/domains/collections/collections.validator.ts
import { z } from 'zod'

export const createCollectionSchema = z.object({
  name: z.string().min(1).max(100),
  parentId: z.string().uuid().optional(),
})

export const updateCollectionSchema = z.object({
  name: z.string().min(1).max(100),
})
