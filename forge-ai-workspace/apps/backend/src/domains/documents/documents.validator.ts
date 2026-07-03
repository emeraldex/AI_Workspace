// File: apps/backend/src/domains/documents/documents.validator.ts
import { z } from 'zod'

export const createDocumentSchema = z.object({
  title: z.string().min(1).max(500),
  body: z.string().default(''),
  collectionId: z.string().uuid().optional(),
  tagIds: z.array(z.string().uuid()).optional(),
})

export const updateDocumentSchema = createDocumentSchema.partial()

export const exportQuerySchema = z.object({
  format: z.enum(['markdown', 'text']).default('markdown'),
})
