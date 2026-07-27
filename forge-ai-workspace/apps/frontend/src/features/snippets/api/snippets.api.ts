// File: apps/frontend/src/features/snippets/api/snippets.api.ts
// Purpose: Typed wrappers for /api/v1/snippets

import { apiClient } from '@shared/api/client'
import type { ApiResponse, PaginatedResponse } from '@forge/shared'

export interface Snippet {
  id: string
  title: string
  language: string
  code: string
  tags: string[]
  createdAt: string
  updatedAt: string
}

export interface SnippetFilters {
  language?: string
  search?: string
}

export interface CreateSnippetInput {
  title: string
  language: string
  code: string
  tags?: string[]
}

export type UpdateSnippetInput = Partial<CreateSnippetInput>

export interface SnippetPage {
  data: Snippet[]
  pagination: { nextCursor: string | null; hasMore: boolean; total: number }
}

export const snippetsApi = {
  async list(filters: SnippetFilters, cursor?: string, limit = 20): Promise<SnippetPage> {
    const params: Record<string, string | number> = { limit }
    if (filters.language) params.language = filters.language
    if (filters.search) params.search = filters.search
    if (cursor) params.cursor = cursor

    const { data } = await apiClient.get<PaginatedResponse<Snippet>>('/snippets', { params })
    return { data: data.data, pagination: data.pagination }
  },

  async create(body: CreateSnippetInput): Promise<Snippet> {
    const { data } = await apiClient.post<ApiResponse<Snippet>>('/snippets', body)
    return data.data
  },

  async update(id: string, body: UpdateSnippetInput): Promise<Snippet> {
    const { data } = await apiClient.patch<ApiResponse<Snippet>>(`/snippets/${id}`, body)
    return data.data
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/snippets/${id}`)
  },
}
