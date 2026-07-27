// File: apps/frontend/src/features/projects/api/projects.api.ts
// Purpose: Typed wrappers for /api/v1/projects — shapes mirror projects.service.ts toProjectDto

import { apiClient } from '@shared/api/client'
import type { ApiResponse } from '@forge/shared'

export interface Project {
  id: string
  name: string
  description: string | null
  color: string | null
  icon: string | null
  isArchived: boolean
  taskCount: number
  completedCount: number
  createdAt: string
  updatedAt: string
}

export interface CreateProjectInput {
  name: string
  description?: string
  /** #rrggbb */
  color?: string
  icon?: string
}

export type UpdateProjectInput = Partial<CreateProjectInput>

export const projectsApi = {
  async list(includeArchived = false): Promise<Project[]> {
    const { data } = await apiClient.get<ApiResponse<Project[]>>('/projects', {
      params: includeArchived ? { includeArchived: 'true' } : {},
    })
    return data.data
  },

  async create(body: CreateProjectInput): Promise<Project> {
    const { data } = await apiClient.post<ApiResponse<Project>>('/projects', body)
    return data.data
  },

  async update(id: string, body: UpdateProjectInput): Promise<Project> {
    const { data } = await apiClient.patch<ApiResponse<Project>>(`/projects/${id}`, body)
    return data.data
  },

  async archive(id: string): Promise<void> {
    await apiClient.patch(`/projects/${id}/archive`)
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/projects/${id}`)
  },
}
