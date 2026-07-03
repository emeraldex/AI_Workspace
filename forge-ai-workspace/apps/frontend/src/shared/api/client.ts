// File: apps/frontend/src/shared/api/client.ts
// Purpose: Axios instance with JWT interceptor and automatic token refresh

import axios from 'axios'
import { useAuthStore } from '../stores/auth.store'

export const apiClient = axios.create({
  baseURL: '/api/v1',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
})

// Attach access token to every request
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// On 401, attempt silent refresh then retry
let isRefreshing = false
let queue: Array<(token: string) => void> = []

apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config
    if (error.response?.status !== 401 || original._retry) {
      return Promise.reject(error)
    }
    original._retry = true

    if (isRefreshing) {
      return new Promise((resolve) => {
        queue.push((token) => {
          original.headers.Authorization = `Bearer ${token}`
          resolve(apiClient(original))
        })
      })
    }

    isRefreshing = true
    try {
      const { data } = await axios.post('/api/v1/auth/refresh', {}, { withCredentials: true })
      const newToken = data.data.accessToken
      useAuthStore.getState().setAccessToken(newToken)
      queue.forEach((cb) => cb(newToken))
      queue = []
      original.headers.Authorization = `Bearer ${newToken}`
      return apiClient(original)
    } catch {
      useAuthStore.getState().clearAuth()
      window.location.href = '/login'
      return Promise.reject(error)
    } finally {
      isRefreshing = false
    }
  },
)
