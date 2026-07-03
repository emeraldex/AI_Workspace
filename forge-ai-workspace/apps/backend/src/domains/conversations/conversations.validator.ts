// File: apps/backend/src/domains/conversations/conversations.validator.ts
import { z } from 'zod'

export const createConversationSchema = z.object({
  title: z.string().min(1).max(200).default('New Conversation'),
})

export const updateConversationSchema = z.object({
  title: z.string().min(1).max(200),
})

export const sendMessageSchema = z.object({
  content: z.string().min(1).max(32000),
  documentIds: z.array(z.string().uuid()).optional(),
})
