// File: apps/frontend/src/features/projects/components/ProjectList.tsx
// Purpose: Project card grid with loading/error/empty states

import { FolderKanban, RefreshCw } from 'lucide-react'
import { Button } from '@shared/components/ui/Button'
import { Card, CardContent } from '@shared/components/ui/Card'
import { Skeleton } from '@shared/components/ui/Skeleton'
import { getApiErrorMessage } from '@shared/lib/apiError'
import { useProjects } from '../hooks/useProjects'
import { ProjectCard } from './ProjectCard'
import type { Project } from '../api/projects.api'

interface ProjectListProps {
  includeArchived: boolean
  onEdit: (project: Project) => void
  onCreate: () => void
}

export function ProjectList({ includeArchived, onEdit, onCreate }: ProjectListProps) {
  const { data, isPending, isError, error, refetch } = useProjects(includeArchived)

  if (isPending) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton key={i} className="h-44" />
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
          <p className="text-sm text-muted-foreground">
            {getApiErrorMessage(error, 'Failed to load projects')}
          </p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw />
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (data.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
          <FolderKanban className="h-10 w-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            No projects yet. Group your tasks by creating one.
          </p>
          <Button size="sm" onClick={onCreate}>
            New project
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {data.map((project) => (
        <ProjectCard key={project.id} project={project} onEdit={onEdit} />
      ))}
    </div>
  )
}
