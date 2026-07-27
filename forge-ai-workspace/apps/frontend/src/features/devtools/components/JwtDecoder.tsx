// File: apps/frontend/src/features/devtools/components/JwtDecoder.tsx
// Purpose: Decode a JWT's header and payload locally — no verification, no network

import { useMemo, useState } from 'react'
import { Input } from '@shared/components/ui/Input'

function decodeBase64Url(segment: string): unknown {
  const base64 = segment.replace(/-/g, '+').replace(/_/g, '/')
  const json = decodeURIComponent(
    atob(base64)
      .split('')
      .map((c) => `%${c.charCodeAt(0).toString(16).padStart(2, '0')}`)
      .join(''),
  )
  return JSON.parse(json)
}

export function JwtDecoder() {
  const [token, setToken] = useState('')

  const decoded = useMemo(() => {
    const trimmed = token.trim()
    if (!trimmed) return null
    const parts = trimmed.split('.')
    if (parts.length !== 3) return { error: 'A JWT has three dot-separated segments' }
    try {
      const header = decodeBase64Url(parts[0])
      const payload = decodeBase64Url(parts[1]) as Record<string, unknown>
      const exp = typeof payload.exp === 'number' ? new Date(payload.exp * 1000) : null
      return { header, payload, exp }
    } catch {
      return { error: 'Could not decode — is this a valid JWT?' }
    }
  }, [token])

  return (
    <div className="flex flex-col gap-3">
      <Input
        value={token}
        onChange={(e) => setToken(e.target.value)}
        placeholder="eyJhbGciOi…"
        spellCheck={false}
        className="font-mono text-xs"
        aria-label="JWT input"
      />
      <p className="text-xs text-muted-foreground">
        Decoded locally in your browser. Signatures are not verified.
      </p>
      {decoded && 'error' in decoded && (
        <p role="alert" className="text-xs text-destructive">
          {decoded.error}
        </p>
      )}
      {decoded && 'payload' in decoded && (
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <p className="mb-1 text-xs font-medium text-muted-foreground">Header</p>
            <pre className="overflow-auto rounded-md border bg-background p-3 font-mono text-xs">
              {JSON.stringify(decoded.header, null, 2)}
            </pre>
          </div>
          <div>
            <p className="mb-1 text-xs font-medium text-muted-foreground">
              Payload
              {decoded.exp && (
                <span className={decoded.exp < new Date() ? 'ml-2 text-destructive' : 'ml-2 text-success'}>
                  {decoded.exp < new Date() ? 'expired' : 'valid'} · exp {decoded.exp.toLocaleString()}
                </span>
              )}
            </p>
            <pre className="overflow-auto rounded-md border bg-background p-3 font-mono text-xs">
              {JSON.stringify(decoded.payload, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  )
}
