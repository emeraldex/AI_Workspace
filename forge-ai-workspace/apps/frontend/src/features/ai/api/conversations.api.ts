// File: apps/frontend/src/features/ai/api/conversations.api.ts
// Purpose: Typed wrappers for /api/v1/conversations

import { apiClient } from '@shared/api/client'
import type { ApiResponse, PaginatedResponse } from '@forge/shared'

export type MessageRole = 'USER' | 'ASSISTANT'

export interface Message {
  id: string
  role: MessageRole
  content: string
  tokenCount: number | null
  createdAt: string
}

export interface ConversationSummary {
  id: string
  title: string
  messageCount: number
  updatedAt: string
}

export interface ConversationDetail {
  id: string
  title: string
  messages: Message[]
  createdAt: string
  updatedAt: string
}

export interface SendMessageResult {
  userMessage: Message
  streamId: string
}

export interface ConversationPage {
  data: ConversationSummary[]
  pagination: { nextCursor: string | null; hasMore: boolean; total: number }
}

export const conversationsApi = {
  async list(cursor?: string, limit = 30): Promise<ConversationPage> {
    const params: Record<string, string | number> = { limit }
    if (cursor) params.cursor = cursor
    const { data } = await apiClient.get<PaginatedResponse<ConversationSummary>>('/conversations', {
      params,
    })
    return { data: data.data, pagination: data.pagination }
  },

  async get(id: string): Promise<ConversationDetail> {
    const { data } = await apiClient.get<ApiResponse<ConversationDetail>>(`/conversations/${id}`)
    return data.data
  },

  async create(title?: string): Promise<ConversationDetail> {
    const { data } = await apiClient.post<ApiResponse<ConversationDetail>>('/conversations', {
      title: title ?? 'New Conversation',
    })
    return data.data
  },

  async rename(id: string, title: string): Promise<ConversationSummary> {
    const { data } = await apiClient.patch<ApiResponse<ConversationSummary>>(
      `/conversations/${id}`,
      { title },
    )
    return data.data
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/conversations/${id}`)
  },

  async sendMessage(id: string, content: string): Promise<SendMessageResult> {
    const { data } = await apiClient.post<ApiResponse<SendMessageResult>>(
      `/conversations/${id}/messages`,
      { content },
    )
    return data.data
  },
}
