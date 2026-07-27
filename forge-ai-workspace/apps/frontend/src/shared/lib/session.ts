// File: apps/frontend/src/shared/lib/session.ts
// Purpose: Session lifecycle helpers shared by auth feature and layout chrome.
//          Lives in shared/ so layout components never import from features/.

import { apiClient } from '@shared/api/client'
import { useAuthStore } from '@shared/stores/auth.store'

export async function logout(): Promise<void> {
  try {
    await apiClient.post('/auth/logout')
  } catch {
    // Session is being discarded either way — a failed revoke must not block logout
  } finally {
    useAuthStore.getState().clearAuth()
  }
}
