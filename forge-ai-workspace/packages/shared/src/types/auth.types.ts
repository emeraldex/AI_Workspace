// File: packages/shared/src/types/auth.types.ts
// Purpose: Auth request/response types shared between frontend and backend

export interface RegisterRequest {
  name: string
  email: string
  password: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
}

export interface TokenResponse {
  accessToken: string
}

export interface AuthUser {
  id: string
  name: string
  email: string
  avatarUrl: string | null
}

export interface AuthResponse {
  user: AuthUser
  accessToken: string
}
