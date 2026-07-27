// File: apps/frontend/src/features/projects/pages/ProjectsPage.tsx
// Purpose: Projects page — card grid, archived toggle, create/edit dialog

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { PageContainer } from '@shared/components/layout/PageContainer'
import { Button } from '@shared/components/ui/Button'
import { Label } from '@shared/components/ui/Label'
import { ProjectList } from '../components/ProjectList'
import { ProjectForm } from '../components/ProjectForm'
import type { Project } from '../api/projects.api'

export function ProjectsPage() {
  const [includeArchived, setIncludeArchived] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)

  function openCreate() {
    setEditingProject(null)
    setFormOpen(true)
  }

  function openEdit(project: Project) {
    setEditingProject(project)
    setFormOpen(true)
  }

  return (
    <PageContainer
      title="Projects"
      description="Group related tasks and track progress"
      actions={
        <Button onClick={openCreate}>
          <Plus />
          New project
        </Button>
      }
    >
      <div className="mb-4 flex items-center gap-2">
        <input
          id="show-archived"
          type="checkbox"
          checked={includeArchived}
          onChange={(e) => setIncludeArchived(e.target.checked)}
          className="h-4 w-4 rounded border-input accent-[hsl(var(--primary))]"
        />
        <Label htmlFor="show-archived" className="cursor-pointer text-muted-foreground">
          Show archived
        </Label>
      </div>

      <ProjectList includeArchived={includeArchived} onEdit={openEdit} onCreate={openCreate} />
      <ProjectForm open={formOpen} onOpenChange={setFormOpen} project={editingProject} />
    </PageContainer>
  )
}
