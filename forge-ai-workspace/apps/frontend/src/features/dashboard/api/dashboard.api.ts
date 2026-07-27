// File: apps/frontend/src/features/dashboard/api/dashboard.api.ts
// Purpose: Typed wrapper for GET /api/v1/dashboard — shape mirrors dashboard.service.ts

import { apiClient } from '@shared/api/client'
import type { ApiResponse } from '@forge/shared'

export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'

export interface DashboardTask {
  id: string
  title: string
  priority: TaskPriority
  dueDate: string | null
}

export interface DashboardRecentItem {
  id: string
  title: string
  updatedAt: string
}

export interface DashboardData {
  taskSummary: {
    todo: number
    inProgress: number
    inReview: number
    done: number
    cancelled: number
  }
  todayTasks: DashboardTask[]
  overdueTasks: DashboardTask[]
  recentDocuments: DashboardRecentItem[]
  recentConversations: DashboardRecentItem[]
  streak: number
}

export const dashboardApi = {
  async get(): Promise<DashboardData> {
    const { data } = await apiClient.get<ApiResponse<DashboardData>>('/dashboard')
    return data.data
  },
}
