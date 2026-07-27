// File: apps/frontend/src/features/tasks/pages/TasksPage.tsx
// Purpose: Tasks page — filter bar, list/board view toggle, create/edit dialog

import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Columns3, List, Plus } from 'lucide-react'
import { PageContainer } from '@shared/components/layout/PageContainer'
import { Button } from '@shared/components/ui/Button'
import { useDebounce } from '@shared/hooks/useDebounce'
import { TaskFilters } from '../components/TaskFilters'
import { TaskList } from '../components/TaskList'
import { TaskBoard } from '../components/TaskBoard'
import { TaskForm } from '../components/TaskForm'
import type { Task, TaskFilters as Filters } from '../api/tasks.api'

type TaskView = 'list' | 'board'

export function TasksPage() {
  // Seed filters from the URL (project cards and command-palette results link here)
  const [searchParams, setSearchParams] = useSearchParams()
  const [filters, setFilters] = useState<Filters>(() => ({
    projectId: searchParams.get('projectId') ?? undefined,
    search: searchParams.get('search') ?? undefined,
  }))
  const [formOpen, setFormOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)

  // View lives in the URL (?view=board) so it survives reloads and can be linked
  const view: TaskView = searchParams.get('view') === 'board' ? 'board' : 'list'

  function setView(next: TaskView) {
    setSearchParams(
      (prev) => {
        const params = new URLSearchParams(prev)
        if (next === 'board') params.set('view', 'board')
        else params.delete('view')
        return params
      },
      { replace: true },
    )
  }

  // Debounce free-text search so we don't query per keystroke
  const debouncedSearch = useDebounce(filters.search)
  const effectiveFilters = { ...filters, search: debouncedSearch }

  function openCreate() {
    setEditingTask(null)
    setFormOpen(true)
  }

  function openEdit(task: Task) {
    setEditingTask(task)
    setFormOpen(true)
  }

  return (
    <PageContainer
      title="Tasks"
      description="Everything you're tracking"
      actions={
        <Button onClick={openCreate}>
          <Plus />
          New task
        </Button>
      }
    >
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <TaskFilters filters={filters} onChange={setFilters} />
        </div>
        <div className="flex shrink-0 items-center gap-0.5 rounded-md border p-0.5" role="group" aria-label="View">
          <Button
            variant={view === 'list' ? 'secondary' : 'ghost'}
            size="icon"
            className="h-8 w-8"
            onClick={() => setView('list')}
            aria-label="List view"
            aria-pressed={view === 'list'}
          >
            <List />
          </Button>
          <Button
            variant={view === 'board' ? 'secondary' : 'ghost'}
            size="icon"
            className="h-8 w-8"
            onClick={() => setView('board')}
            aria-label="Board view"
            aria-pressed={view === 'board'}
          >
            <Columns3 />
          </Button>
        </div>
      </div>

      {view === 'board' ? (
        <TaskBoard filters={effectiveFilters} onEdit={openEdit} />
      ) : (
        <TaskList filters={effectiveFilters} onEdit={openEdit} onCreate={openCreate} />
      )}
      <TaskForm open={formOpen} onOpenChange={setFormOpen} task={editingTask} />
    </PageContainer>
  )
}
