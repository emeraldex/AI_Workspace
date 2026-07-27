// File: apps/backend/src/sockets/socket.auth.ts
// Purpose: Socket.IO connection authentication — verifies the JWT from the
//          handshake (auth.token preferred, ?token= query fallback per Phase 8)

import jwt from 'jsonwebtoken'
import type { Socket } from 'socket.io'
import { config } from '../shared/config'

interface JwtPayload {
  sub: string
  email: string
  name: string
}

export function socketAuth(socket: Socket, next: (err?: Error) => void): void {
  const token =
    (socket.handshake.auth?.token as string | undefined) ??
    (socket.handshake.query?.token as string | undefined)

  if (!token) {
    next(new Error('Authentication required'))
    return
  }

  try {
    const payload = jwt.verify(token, config.jwt.secret) as JwtPayload
    socket.data.userId = payload.sub
    next()
  } catch {
    next(new Error('Invalid token'))
  }
}
