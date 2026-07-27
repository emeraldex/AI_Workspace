// File: apps/frontend/src/shared/hooks/useClipboard.ts
// Purpose: Copy text to clipboard with a transient "copied" state for button feedback

import { useCallback, useEffect, useRef, useState } from 'react'

export function useClipboard(resetAfterMs = 2000) {
  const [copied, setCopied] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => () => clearTimeout(timer.current), [])

  const copy = useCallback(
    async (text: string) => {
      try {
        await navigator.clipboard.writeText(text)
        setCopied(true)
        clearTimeout(timer.current)
        timer.current = setTimeout(() => setCopied(false), resetAfterMs)
      } catch {
        // Clipboard unavailable (permissions/insecure context) — leave state unchanged
      }
    },
    [resetAfterMs],
  )

  return { copied, copy }
}
