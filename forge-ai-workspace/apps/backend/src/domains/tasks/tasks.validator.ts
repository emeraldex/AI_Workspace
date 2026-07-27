// File: apps/backend/src/domains/tasks/tasks.validator.ts
import { z } from 'zod'

export const createTaskSchema = z.object({
  title: z.string().min(1).max(500),
  description: z.string().optional(),
  projectId: z.string().uuid().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  status: z.enum(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE', 'CANCELLED']).default('TODO'),
  dueDate: z.coerce.date().optional(),
  tagIds: z.array(z.string().uuid()).optional(),
  sortOrder: z.number().int().default(0),
})

// Updates additionally allow null for projectId/dueDate to clear them.
// (dueDate uses a union because z.coerce.date() would turn null into 1970-01-01.)
export const updateTaskSchema = createTaskSchema.partial().extend({
  projectId: z.string().uuid().nullable().optional(),
  dueDate: z.union([z.null(), z.coerce.date()]).optional(),
})

export const reorderSchema = z.object({
  updates: z.array(
    z.object({
      id: z.string().uuid(),
      sortOrder: z.number().int(),
      status: z.enum(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE', 'CANCELLED']).optional(),
    }),
  ),
})

export const createSubtaskSchema = z.object({
  title: z.string().min(1).max(500),
  sortOrder: z.number().int().default(0),
})

export const updateSubtaskSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  isCompleted: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
})

export const taskQuerySchema = z.object({
  projectId: z.string().uuid().optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE', 'CANCELLED']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  tagIds: z.string().optional(),
  dueBefore: z.coerce.date().optional(),
  dueAfter: z.coerce.date().optional(),
  search: z.string().optional(),
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})
