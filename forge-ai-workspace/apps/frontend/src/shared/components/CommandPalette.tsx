// File: apps/frontend/src/shared/components/CommandPalette.tsx
// Purpose: ⌘K palette — navigation commands + server-side global search
//          across tasks, documents, snippets, and conversations

import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Command } from 'cmdk'
import {
  Code2,
  FileText,
  FolderKanban,
  LayoutDashboard,
  ListTodo,
  MessagesSquare,
  Search,
  Settings,
} from 'lucide-react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { globalSearch } from '@shared/api/search'
import { useDebounce } from '@shared/hooks/useDebounce'
import { useKeyboardShortcut } from '@shared/hooks/useKeyboardShortcut'
import { useUIStore } from '@shared/stores/ui.store'
import { Spinner } from '@shared/components/ui/Spinner'

const NAV_COMMANDS = [
  { label: 'Go to Dashboard', to: '/', icon: LayoutDashboard },
  { label: 'Go to Tasks', to: '/tasks', icon: ListTodo },
  { label: 'Go to Projects', to: '/projects', icon: FolderKanban },
  { label: 'Go to Documents', to: '/documents', icon: FileText },
  { label: 'Go to AI Chat', to: '/ai', icon: MessagesSquare },
  { label: 'Go to Snippets', to: '/snippets', icon: Code2 },
  { label: 'Go to Settings', to: '/settings', icon: Settings },
]

const itemClass =
  'flex cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-2 text-sm text-foreground ' +
  'data-[selected=true]:bg-primary/10 data-[selected=true]:text-primary'

export function CommandPalette() {
  const open = useUIStore((s) => s.commandPaletteOpen)
  const setOpen = useUIStore((s) => s.setCommandPalette)
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const debouncedQuery = useDebounce(query.trim())

  useKeyboardShortcut('k', useCallback(() => setOpen(!useUIStore.getState().commandPaletteOpen), [setOpen]), {
    withModifier: true,
  })

  // Fresh query each time the palette opens
  useEffect(() => {
    if (!open) setQuery('')
  }, [open])

  const { data: results, isFetching } = useQuery({
    queryKey: ['global-search', debouncedQuery],
    queryFn: () => globalSearch(debouncedQuery),
    enabled: open && debouncedQuery.length > 0,
    staleTime: 15_000,
  })

  function go(to: string) {
    setOpen(false)
    navigate(to)
  }

  const showNav = (label: string) =>
    !debouncedQuery || label.toLowerCase().includes(debouncedQuery.toLowerCase())
  const visibleNav = NAV_COMMANDS.filter((c) => showNav(c.label))
  const hasResults =
    results &&
    (results.tasks.length || results.documents.length || results.snippets.length || results.conversations.length)

  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/60 data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          className="fixed left-1/2 top-24 z-50 w-full max-w-lg -translate-x-1/2 overflow-hidden rounded-lg border bg-surface shadow-lg data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95"
          aria-describedby={undefined}
        >
          <DialogPrimitive.Title className="sr-only">Command palette</DialogPrimitive.Title>
          <Command shouldFilter={false} label="Command palette">
            <div className="flex items-center gap-2 border-b px-3">
              <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
              <Command.Input
                value={query}
                onValueChange={setQuery}
                placeholder="Search or jump to…"
                className="h-11 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
              {isFetching && <Spinner />}
            </div>

            <Command.List className="max-h-80 overflow-y-auto p-1.5">
              {debouncedQuery && !isFetching && !hasResults && visibleNav.length === 0 && (
                <Command.Empty className="py-8 text-center text-sm text-muted-foreground">
                  No results for “{debouncedQuery}”
                </Command.Empty>
              )}

              {visibleNav.length > 0 && (
                <Command.Group
                  heading="Navigate"
                  className="[&_[cmdk-group-heading]]:px-2.5 [&_[cmdk-group-heading]]:py-1 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:text-muted-foreground"
                >
                  {visibleNav.map(({ label, to, icon: Icon }) => (
                    <Command.Item key={to} value={`nav-${to}`} onSelect={() => go(to)} className={itemClass}>
                      <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                      {label}
                    </Command.Item>
                  ))}
                </Command.Group>
              )}

              {results && results.tasks.length > 0 && (
                <Command.Group heading="Tasks" className="[&_[cmdk-group-heading]]:px-2.5 [&_[cmdk-group-heading]]:py-1 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:text-muted-foreground">
                  {results.tasks.map((task) => (
                    <Command.Item
                      key={task.id}
                      value={`task-${task.id}`}
                      onSelect={() => go(`/tasks?search=${encodeURIComponent(task.title)}`)}
                      className={itemClass}
                    >
                      <ListTodo className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <span className="min-w-0 flex-1 truncate">{task.title}</span>
                    </Command.Item>
                  ))}
                </Command.Group>
              )}

              {results && results.documents.length > 0 && (
                <Command.Group heading="Documents" className="[&_[cmdk-group-heading]]:px-2.5 [&_[cmdk-group-heading]]:py-1 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:text-muted-foreground">
                  {results.documents.map((doc) => (
                    <Command.Item
                      key={doc.id}
                      value={`doc-${doc.id}`}
                      onSelect={() => go(`/documents/${doc.id}`)}
                      className={itemClass}
                    >
                      <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <span className="min-w-0 flex-1 truncate">
                        {doc.title}
                        <span className="ml-2 text-xs text-muted-foreground">{doc.excerpt}</span>
                      </span>
                    </Command.Item>
                  ))}
                </Command.Group>
              )}

              {results && results.snippets.length > 0 && (
                <Command.Group heading="Snippets" className="[&_[cmdk-group-heading]]:px-2.5 [&_[cmdk-group-heading]]:py-1 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:text-muted-foreground">
                  {results.snippets.map((snippet) => (
                    <Command.Item
                      key={snippet.id}
                      value={`snippet-${snippet.id}`}
                      onSelect={() => go(`/snippets?search=${encodeURIComponent(snippet.title)}`)}
                      className={itemClass}
                    >
                      <Code2 className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <span className="min-w-0 flex-1 truncate">{snippet.title}</span>
                      <span className="shrink-0 font-mono text-xs text-muted-foreground">{snippet.language}</span>
                    </Command.Item>
                  ))}
                </Command.Group>
              )}

              {results && results.conversations.length > 0 && (
                <Command.Group heading="Conversations" className="[&_[cmdk-group-heading]]:px-2.5 [&_[cmdk-group-heading]]:py-1 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:text-muted-foreground">
                  {results.conversations.map((conv) => (
                    <Command.Item
                      key={conv.id}
                      value={`conv-${conv.id}`}
                      onSelect={() => go(`/ai/${conv.id}`)}
                      className={itemClass}
                    >
                      <MessagesSquare className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <span className="min-w-0 flex-1 truncate">{conv.title}</span>
                    </Command.Item>
                  ))}
                </Command.Group>
              )}
            </Command.List>
          </Command>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
