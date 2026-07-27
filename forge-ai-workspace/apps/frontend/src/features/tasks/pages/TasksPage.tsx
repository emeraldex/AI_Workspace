// File: apps/frontend/src/features/tasks/pages/TasksPage.tsx
// Purpose: Tasks page — filter bar, task list, create/edit dialog

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { PageContainer } from '@shared/components/layout/PageContainer'
import { Button } from '@shared/components/ui/Button'
import { useDebounce } from '@shared/hooks/useDebounce'
import { TaskFilters } from '../components/TaskFilters'
import { TaskList } from '../components/TaskList'
import { TaskForm } from '../components/TaskForm'
import type { Task, TaskFilters as Filters } from '../api/tasks.api'

export function TasksPage() {
  const [filters, setFilters] = useState<Filters>({})
  const [formOpen, setFormOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)

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
      <TaskFilters filters={filters} onChange={setFilters} />
      <TaskList filters={effectiveFilters} onEdit={openEdit} onCreate={openCreate} />
      <TaskForm open={formOpen} onOpenChange={setFormOpen} task={editingTask} />
    </PageContainer>
  )
}
