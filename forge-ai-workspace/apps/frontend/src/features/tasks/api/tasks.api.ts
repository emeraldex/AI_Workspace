// File: apps/frontend/src/features/tasks/api/tasks.api.ts
// Purpose: Typed wrappers for /api/v1/tasks — shapes mirror tasks.service.ts toTaskDto

import { apiClient } from '@shared/api/client'
import type { ApiResponse, PaginatedResponse } from '@forge/shared'

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE' | 'CANCELLED'
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'

export interface TaskProject {
  id: string
  name: string
  color: string | null
}

export interface TaskTag {
  id: string
  name: string
  color: string | null
}

export interface Subtask {
  id: string
  title: string
  isCompleted: boolean
  sortOrder: number
}

export interface Task {
  id: string
  title: string
  description: string | null
  status: TaskStatus
  priority: TaskPriority
  dueDate: string | null
  sortOrder: number
  project: TaskProject | null
  tags: TaskTag[]
  subtasks?: Subtask[]
  subtaskCount: number
  completedSubtaskCount: number
  createdAt: string
  updatedAt: string
}

export interface TaskFilters {
  status?: TaskStatus
  priority?: TaskPriority
  projectId?: string
  search?: string
}

export interface CreateTaskInput {
  title: string
  description?: string
  priority?: TaskPriority
  status?: TaskStatus
  dueDate?: string
  projectId?: string
  tagIds?: string[]
}

// projectId/dueDate accept null on update to clear them (backend updateTaskSchema)
export type UpdateTaskInput = Partial<Omit<CreateTaskInput, 'projectId' | 'dueDate'>> & {
  projectId?: string | null
  dueDate?: string | null
}

/** Minimal project shape for pickers. Fetched here (not from the projects
 *  feature) because features must not import across feature boundaries. */
export interface ProjectOption {
  id: string
  name: string
  color: string | null
}

export interface TaskPage {
  data: Task[]
  pagination: { nextCursor: string | null; hasMore: boolean; total: number }
}

// Mirrors backend reorderSchema (tasks.validator.ts)
export interface ReorderUpdate {
  id: string
  sortOrder: number
  status?: TaskStatus
}

export const tasksApi = {
  async list(filters: TaskFilters, cursor?: string, limit = 20): Promise<TaskPage> {
    const params: Record<string, string | number> = { limit }
    if (filters.status) params.status = filters.status
    if (filters.priority) params.priority = filters.priority
    if (filters.projectId) params.projectId = filters.projectId
    if (filters.search) params.search = filters.search
    if (cursor) params.cursor = cursor

    const { data } = await apiClient.get<PaginatedResponse<Task>>('/tasks', { params })
    return { data: data.data, pagination: data.pagination }
  },

  async get(id: string): Promise<Task> {
    const { data } = await apiClient.get<ApiResponse<Task>>(`/tasks/${id}`)
    return data.data
  },

  async create(body: CreateTaskInput): Promise<Task> {
    const { data } = await apiClient.post<ApiResponse<Task>>('/tasks', body)
    return data.data
  },

  async update(id: string, body: UpdateTaskInput): Promise<Task> {
    const { data } = await apiClient.patch<ApiResponse<Task>>(`/tasks/${id}`, body)
    return data.data
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/tasks/${id}`)
  },

  async reorder(updates: ReorderUpdate[]): Promise<void> {
    await apiClient.patch('/tasks/reorder', { updates })
  },

  async createSubtask(taskId: string, title: string): Promise<Subtask> {
    const { data } = await apiClient.post<ApiResponse<Subtask>>(`/tasks/${taskId}/subtasks`, { title })
    return data.data
  },

  async updateSubtask(
    taskId: string,
    subtaskId: string,
    body: { title?: string; isCompleted?: boolean; sortOrder?: number },
  ): Promise<Subtask> {
    const { data } = await apiClient.patch<ApiResponse<Subtask>>(
      `/tasks/${taskId}/subtasks/${subtaskId}`,
      body,
    )
    return data.data
  },

  async removeSubtask(taskId: string, subtaskId: string): Promise<void> {
    await apiClient.delete(`/tasks/${taskId}/subtasks/${subtaskId}`)
  },

  async listProjectOptions(): Promise<ProjectOption[]> {
    const { data } = await apiClient.get<ApiResponse<ProjectOption[]>>('/projects')
    return data.data
  },
}
