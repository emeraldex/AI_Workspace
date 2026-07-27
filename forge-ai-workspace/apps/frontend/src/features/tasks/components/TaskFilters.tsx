// File: apps/frontend/src/features/tasks/components/TaskFilters.tsx
// Purpose: Status/priority/search filter bar for the task list

import { Search } from 'lucide-react'
import { Input } from '@shared/components/ui/Input'
import { Select } from '@shared/components/ui/Select'
import { STATUS_LABELS, PRIORITY_LABELS } from '@shared/lib/constants'
import { useProjectOptions } from '../hooks/useTasks'
import type { TaskFilters as Filters, TaskPriority, TaskStatus } from '../api/tasks.api'

interface TaskFiltersProps {
  filters: Filters
  onChange: (filters: Filters) => void
}

export function TaskFilters({ filters, onChange }: TaskFiltersProps) {
  const { data: projectOptions } = useProjectOptions()

  return (
    <div className="mb-4 flex flex-wrap items-center gap-3">
      <div className="relative min-w-52 flex-1">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-8"
          placeholder="Search tasks…"
          value={filters.search ?? ''}
          onChange={(e) => onChange({ ...filters, search: e.target.value || undefined })}
          aria-label="Search tasks"
        />
      </div>

      <Select
        className="w-40"
        value={filters.status ?? ''}
        onChange={(e) =>
          onChange({ ...filters, status: (e.target.value || undefined) as TaskStatus | undefined })
        }
        aria-label="Filter by status"
      >
        <option value="">All statuses</option>
        {(Object.keys(STATUS_LABELS) as TaskStatus[]).map((status) => (
          <option key={status} value={status}>
            {STATUS_LABELS[status]}
          </option>
        ))}
      </Select>

      <Select
        className="w-36"
        value={filters.priority ?? ''}
        onChange={(e) =>
          onChange({
            ...filters,
            priority: (e.target.value || undefined) as TaskPriority | undefined,
          })
        }
        aria-label="Filter by priority"
      >
        <option value="">All priorities</option>
        {(Object.keys(PRIORITY_LABELS) as TaskPriority[]).map((priority) => (
          <option key={priority} value={priority}>
            {PRIORITY_LABELS[priority]}
          </option>
        ))}
      </Select>

      <Select
        className="w-44"
        value={filters.projectId ?? ''}
        onChange={(e) => onChange({ ...filters, projectId: e.target.value || undefined })}
        aria-label="Filter by project"
      >
        <option value="">All projects</option>
        {(projectOptions ?? []).map((project) => (
          <option key={project.id} value={project.id}>
            {project.name}
          </option>
        ))}
      </Select>
    </div>
  )
}
