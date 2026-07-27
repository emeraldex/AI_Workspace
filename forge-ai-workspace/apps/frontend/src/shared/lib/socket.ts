// File: apps/frontend/src/shared/lib/socket.ts
// Purpose: Socket.IO client singleton. Same-origin — Vite proxies /socket.io
//          in dev. Auth callback reads the current access token per attempt,
//          so reconnects after a token refresh authenticate correctly.

import { io, type Socket } from 'socket.io-client'
import { useAuthStore } from '@shared/stores/auth.store'

let socket: Socket | null = null

export function getSocket(): Socket {
  if (!socket) {
    socket = io({
      autoConnect: false,
      withCredentials: true,
      auth: (cb) => cb({ token: useAuthStore.getState().accessToken }),
    })
  }
  return socket
}
