// File: apps/frontend/src/shared/stores/socket.store.ts
// Purpose: Socket.IO connection state (for connection indicators)

import { create } from 'zustand'

interface SocketState {
  connected: boolean
  setConnected: (connected: boolean) => void
}

export const useSocketStore = create<SocketState>((set) => ({
  connected: false,
  setConnected: (connected) => set({ connected }),
}))
