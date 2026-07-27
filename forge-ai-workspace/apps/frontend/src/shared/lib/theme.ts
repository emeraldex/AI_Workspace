// File: apps/frontend/src/shared/lib/theme.ts
// Purpose: Applies a theme to the document and persists it for the pre-paint
//          bootstrap script in index.html (localStorage key 'forge-theme').

import type { Theme } from '@forge/shared'

export const THEME_STORAGE_KEY = 'forge-theme'

export function applyTheme(theme: Theme): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme)
  } catch {
    // Storage unavailable (private mode) — theme still applies for this session
  }
  const isDark =
    theme === 'DARK' ||
    (theme === 'SYSTEM' && window.matchMedia('(prefers-color-scheme: dark)').matches)
  document.documentElement.classList.toggle('dark', isDark)
}
