// File: packages/shared/src/types/api.types.ts
// Purpose: Universal API response shapes used by both frontend and backend

export interface ApiResponse<T> {
  success: true
  data: T
}

export interface ApiError {
  success: false
  message: string
  errors?: FieldError[]
}

export interface FieldError {
  field: string
  message: string
}

export interface PaginatedResponse<T> {
  success: true
  data: T[]
  pagination: {
    nextCursor: string | null
    hasMore: boolean
    total: number
  }
}

export interface PaginationParams {
  cursor?: string
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}
