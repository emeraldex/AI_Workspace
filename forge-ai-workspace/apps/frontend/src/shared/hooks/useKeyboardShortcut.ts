// File: apps/frontend/src/shared/hooks/useKeyboardShortcut.ts
// Purpose: Global keyboard shortcut listener (e.g. ⌘K / Ctrl+K)

import { useEffect } from 'react'

interface ShortcutOptions {
  /** Require Cmd (mac) / Ctrl (elsewhere) */
  withModifier?: boolean
}

export function useKeyboardShortcut(
  key: string,
  callback: () => void,
  { withModifier = false }: ShortcutOptions = {},
) {
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key.toLowerCase() !== key.toLowerCase()) return
      if (withModifier && !e.metaKey && !e.ctrlKey) return
      if (!withModifier) {
        // Bare-key shortcuts must not fire while typing
        const target = e.target as HTMLElement
        if (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return
      }
      e.preventDefault()
      callback()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [key, callback, withModifier])
}
