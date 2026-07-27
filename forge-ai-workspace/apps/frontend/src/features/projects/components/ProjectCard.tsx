// File: apps/frontend/src/features/projects/components/ProjectCard.tsx
// Purpose: Project tile — color, progress, and actions (view tasks, edit, archive, delete)

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Archive, ListTodo, Pencil, Trash2 } from 'lucide-react'
import { Badge } from '@shared/components/ui/Badge'
import { Button } from '@shared/components/ui/Button'
import { Card, CardContent, CardHeader } from '@shared/components/ui/Card'
import { ConfirmDialog } from '@shared/components/ui/ConfirmDialog'
import { useArchiveProject, useDeleteProject } from '../hooks/useProjects'
import type { Project } from '../api/projects.api'

const DEFAULT_COLOR = '#3b82f6'

export function ProjectCard({ project, onEdit }: { project: Project; onEdit: (p: Project) => void }) {
  const archiveProject = useArchiveProject()
  const deleteProject = useDeleteProject()
  const [confirmOpen, setConfirmOpen] = useState(false)

  const progress =
    project.taskCount > 0 ? Math.round((project.completedCount / project.taskCount) * 100) : 0

  return (
    <Card className={project.isArchived ? 'opacity-60' : undefined}>
      <CardHeader className="flex-row items-center gap-2 space-y-0">
        <span
          className="h-3 w-3 shrink-0 rounded-full"
          style={{ backgroundColor: project.color ?? DEFAULT_COLOR }}
          aria-hidden
        />
        <h3 className="min-w-0 flex-1 truncate text-sm font-semibold">{project.name}</h3>
        {project.isArchived && <Badge variant="secondary">Archived</Badge>}
      </CardHeader>

      <CardContent className="flex flex-col gap-3">
        <p className="line-clamp-2 min-h-8 text-xs text-muted-foreground">
          {project.description || 'No description'}
        </p>

        <div>
          <div className="mb-1 flex justify-between text-xs text-muted-foreground">
            <span>
              {project.completedCount}/{project.taskCount} tasks done
            </span>
            <span>{progress}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${progress}%`, backgroundColor: project.color ?? DEFAULT_COLOR }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <Button variant="outline" size="sm" asChild>
            <Link to={`/tasks?projectId=${project.id}`}>
              <ListTodo />
              View tasks
            </Link>
          </Button>
          <div className="flex items-center">
            <Button variant="ghost" size="icon" onClick={() => onEdit(project)} aria-label="Edit project">
              <Pencil />
            </Button>
            {!project.isArchived && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => archiveProject.mutate(project.id)}
                disabled={archiveProject.isPending}
                aria-label="Archive project"
              >
                <Archive />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setConfirmOpen(true)}
              aria-label="Delete project"
              className="text-muted-foreground hover:text-destructive"
            >
              <Trash2 />
            </Button>
          </div>
        </div>
      </CardContent>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete project?"
        description={`"${project.name}" will be moved to trash. Its tasks keep existing without a project.`}
        onConfirm={() => deleteProject.mutate(project.id, { onSuccess: () => setConfirmOpen(false) })}
        isPending={deleteProject.isPending}
      />
    </Card>
  )
}
