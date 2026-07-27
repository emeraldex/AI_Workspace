// File: apps/frontend/src/features/auth/api/auth.api.ts
// Purpose: Typed wrappers around /api/v1/auth and /api/v1/users/me endpoints

import axios from 'axios'
import { apiClient } from '@shared/api/client'
import type {
  ApiResponse,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  TokenResponse,
  UserProfile,
} from '@forge/shared'

export const authApi = {
  async register(body: RegisterRequest): Promise<AuthResponse> {
    const { data } = await apiClient.post<ApiResponse<AuthResponse>>('/auth/register', body)
    return data.data
  },

  async login(body: LoginRequest): Promise<AuthResponse> {
    const { data } = await apiClient.post<ApiResponse<AuthResponse>>('/auth/login', body)
    return data.data
  },

  // Uses a bare axios call: the shared client's 401 interceptor must not
  // trigger a refresh loop while we are the refresh call.
  async refresh(): Promise<TokenResponse> {
    const { data } = await axios.post<ApiResponse<TokenResponse>>(
      '/api/v1/auth/refresh',
      {},
      { withCredentials: true },
    )
    return data.data
  },

  async me(): Promise<UserProfile> {
    const { data } = await apiClient.get<ApiResponse<UserProfile>>('/users/me')
    return data.data
  },
}
