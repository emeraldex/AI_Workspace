// File: apps/frontend/src/shared/hooks/useSocket.ts
// Purpose: Connects the shared socket while the caller is mounted and the
//          user is authenticated. Multiple mounts share one connection
//          (socket.io no-ops on repeated connect calls).

import { useEffect } from 'react'
import { getSocket } from '@shared/lib/socket'
import { useAuthStore } from '@shared/stores/auth.store'
import { useSocketStore } from '@shared/stores/socket.store'

export function useSocket() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const setConnected = useSocketStore((s) => s.setConnected)

  useEffect(() => {
    if (!isAuthenticated) return
    const socket = getSocket()

    const onConnect = () => setConnected(true)
    const onDisconnect = () => setConnected(false)
    socket.on('connect', onConnect)
    socket.on('disconnect', onDisconnect)
    socket.connect()

    return () => {
      socket.off('connect', onConnect)
      socket.off('disconnect', onDisconnect)
    }
  }, [isAuthenticated, setConnected])

  return getSocket()
}
