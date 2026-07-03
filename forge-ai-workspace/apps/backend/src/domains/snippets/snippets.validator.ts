// File: apps/backend/src/domains/snippets/snippets.validator.ts
import { z } from 'zod'

export const createSnippetSchema = z.object({
  title: z.string().min(1).max(200),
  language: z.string().min(1).max(50),
  code: z.string().min(1),
  tags: z.array(z.string()).default([]),
})

export const updateSnippetSchema = createSnippetSchema.partial()
