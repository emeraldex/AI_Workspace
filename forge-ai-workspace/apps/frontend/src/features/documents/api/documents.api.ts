// File: apps/frontend/src/features/documents/api/documents.api.ts
// Purpose: Typed wrappers for /api/v1/documents and /api/v1/collections
//          (CollectionTree is part of the documents feature per Phase 6)

import { apiClient } from '@shared/api/client'
import type { ApiResponse, PaginatedResponse } from '@forge/shared'

export type IndexingStatus = 'PENDING' | 'INDEXING' | 'INDEXED' | 'FAILED'

export interface DocumentTag {
  id: string
  name: string
  color: string | null
}

/** List item — body is only returned by get/create */
export interface DocumentSummary {
  id: string
  title: string
  collectionId: string | null
  indexingStatus: IndexingStatus
  tags: DocumentTag[]
  createdAt: string
  updatedAt: string
}

export interface Document extends DocumentSummary {
  body: string
}

export interface DocumentFilters {
  collectionId?: string
  search?: string
}

export interface CreateDocumentInput {
  title: string
  body?: string
  collectionId?: string
}

export type UpdateDocumentInput = Partial<CreateDocumentInput>

export interface DocumentPage {
  data: DocumentSummary[]
  pagination: { nextCursor: string | null; hasMore: boolean; total: number }
}

export interface Collection {
  id: string
  name: string
  parentId: string | null
  children: Collection[]
}

export const documentsApi = {
  async list(filters: DocumentFilters, cursor?: string, limit = 30): Promise<DocumentPage> {
    const params: Record<string, string | number> = { limit }
    if (filters.collectionId) params.collectionId = filters.collectionId
    if (filters.search) params.search = filters.search
    if (cursor) params.cursor = cursor

    const { data } = await apiClient.get<PaginatedResponse<DocumentSummary>>('/documents', { params })
    return { data: data.data, pagination: data.pagination }
  },

  async get(id: string): Promise<Document> {
    const { data } = await apiClient.get<ApiResponse<Document>>(`/documents/${id}`)
    return data.data
  },

  async create(body: CreateDocumentInput): Promise<Document> {
    const { data } = await apiClient.post<ApiResponse<Document>>('/documents', body)
    return data.data
  },

  async update(id: string, body: UpdateDocumentInput): Promise<DocumentSummary> {
    const { data } = await apiClient.patch<ApiResponse<DocumentSummary>>(`/documents/${id}`, body)
    return data.data
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/documents/${id}`)
  },

  /** Returns the raw file body; caller triggers the download */
  async export(id: string, format: 'markdown' | 'text' = 'markdown'): Promise<Blob> {
    const { data } = await apiClient.get(`/documents/${id}/export`, {
      params: { format },
      responseType: 'blob',
    })
    return data
  },

  async listCollections(): Promise<Collection[]> {
    const { data } = await apiClient.get<ApiResponse<Collection[]>>('/collections')
    return data.data
  },

  async createCollection(body: { name: string; parentId?: string }): Promise<Collection> {
    const { data } = await apiClient.post<ApiResponse<Collection>>('/collections', body)
    return data.data
  },

  async renameCollection(id: string, name: string): Promise<Collection> {
    const { data } = await apiClient.patch<ApiResponse<Collection>>(`/collections/${id}`, { name })
    return data.data
  },

  async removeCollection(id: string): Promise<void> {
    await apiClient.delete(`/collections/${id}`)
  },
}
