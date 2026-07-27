// File: apps/frontend/src/features/snippets/pages/SnippetsPage.tsx
// Purpose: Snippets page — search/language filters, card grid, create/edit dialog

import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Plus, Search } from 'lucide-react'
import { PageContainer } from '@shared/components/layout/PageContainer'
import { Button } from '@shared/components/ui/Button'
import { Input } from '@shared/components/ui/Input'
import { Select } from '@shared/components/ui/Select'
import { useDebounce } from '@shared/hooks/useDebounce'
import { SnippetList } from '../components/SnippetList'
import { SnippetForm, COMMON_LANGUAGES } from '../components/SnippetForm'
import type { Snippet, SnippetFilters } from '../api/snippets.api'

export function SnippetsPage() {
  // Command-palette results link here with ?search=
  const [searchParams] = useSearchParams()
  const [filters, setFilters] = useState<SnippetFilters>(() => ({
    search: searchParams.get('search') ?? undefined,
  }))
  const [formOpen, setFormOpen] = useState(false)
  const [editingSnippet, setEditingSnippet] = useState<Snippet | null>(null)

  const debouncedSearch = useDebounce(filters.search)
  const effectiveFilters = { ...filters, search: debouncedSearch }

  function openCreate() {
    setEditingSnippet(null)
    setFormOpen(true)
  }

  function openEdit(snippet: Snippet) {
    setEditingSnippet(snippet)
    setFormOpen(true)
  }

  return (
    <PageContainer
      title="Snippets"
      description="Your reusable code library"
      actions={
        <Button onClick={openCreate}>
          <Plus />
          New snippet
        </Button>
      }
    >
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative min-w-52 flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-8"
            placeholder="Search title or code…"
            value={filters.search ?? ''}
            onChange={(e) => setFilters({ ...filters, search: e.target.value || undefined })}
            aria-label="Search snippets"
          />
        </div>

        <Select
          className="w-44"
          value={filters.language ?? ''}
          onChange={(e) => setFilters({ ...filters, language: e.target.value || undefined })}
          aria-label="Filter by language"
        >
          <option value="">All languages</option>
          {COMMON_LANGUAGES.map((lang) => (
            <option key={lang} value={lang}>
              {lang}
            </option>
          ))}
        </Select>
      </div>

      <SnippetList filters={effectiveFilters} onEdit={openEdit} onCreate={openCreate} />
      <SnippetForm open={formOpen} onOpenChange={setFormOpen} snippet={editingSnippet} />
    </PageContainer>
  )
}
