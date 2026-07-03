// File: apps/backend/src/domains/settings/settings.validator.ts
import { z } from 'zod'

export const updateSettingsSchema = z.object({
  theme: z.enum(['LIGHT', 'DARK', 'SYSTEM']).optional(),
  openaiApiKey: z.string().optional(),
  openaiModel: z.enum(['gpt-4o', 'gpt-4o-mini']).optional(),
  notifyTaskDueSoon: z.boolean().optional(),
  notifyTaskOverdue: z.boolean().optional(),
  notifyAiTaskCreated: z.boolean().optional(),
  dismissedWidgets: z.array(z.string()).optional(),
})
