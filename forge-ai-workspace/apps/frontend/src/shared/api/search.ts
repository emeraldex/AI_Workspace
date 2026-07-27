// File: apps/frontend/src/shared/api/search.ts
// Purpose: Global search wrapper — lives in shared/ because the command
//          palette (a shared component) consumes it.

import { apiClient } from './client'
import type { ApiResponse } from '@forge/shared'

export interface SearchResults {
  tasks: Array<{ id: string; title: string; status: string; priority: string }>
  documents: Array<{ id: string; title: string; excerpt: string }>
  snippets: Array<{ id: string; title: string; language: string }>
  conversations: Array<{ id: string; title: string }>
}

export async function globalSearch(query: string, limit = 5): Promise<SearchResults> {
  const { data } = await apiClient.get<ApiResponse<SearchResults>>('/search', {
    params: { q: query, limit },
  })
  return data.data
}
