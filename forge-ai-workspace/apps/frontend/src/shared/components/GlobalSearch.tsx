// File: apps/frontend/src/shared/components/GlobalSearch.tsx
// Purpose: Header trigger for the command palette — looks like a search input

import { Search } from 'lucide-react'
import { useUIStore } from '@shared/stores/ui.store'

export function GlobalSearch() {
  const setCommandPalette = useUIStore((s) => s.setCommandPalette)

  return (
    <button
      onClick={() => setCommandPalette(true)}
      className="flex h-9 w-64 items-center gap-2 rounded-lg border bg-background px-3 text-sm text-muted-foreground transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      aria-label="Open command palette"
    >
      <Search className="h-4 w-4" />
      <span className="flex-1 text-left">Search…</span>
      <kbd className="rounded border bg-muted px-1.5 py-0.5 font-mono text-[10px]">⌘K</kbd>
    </button>
  )
}
