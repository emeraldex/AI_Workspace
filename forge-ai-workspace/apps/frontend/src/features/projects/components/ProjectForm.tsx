// File: apps/frontend/src/features/projects/components/ProjectForm.tsx
// Purpose: Create/edit project dialog with preset color swatches

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@shared/components/ui/Dialog'
import { Button } from '@shared/components/ui/Button'
import { Input } from '@shared/components/ui/Input'
import { Label } from '@shared/components/ui/Label'
import { Spinner } from '@shared/components/ui/Spinner'
import { Textarea } from '@shared/components/ui/Textarea'
import { getApiErrorMessage } from '@shared/lib/apiError'
import { cn } from '@shared/lib/utils'
import { useCreateProject, useUpdateProject } from '../hooks/useProjects'
import type { Project } from '../api/projects.api'

const PALETTE = [
  '#3b82f6', // blue
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#ef4444', // red
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#14b8a6', // teal
]

interface ProjectFormValues {
  name: string
  description: string
}

interface ProjectFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  project?: Project | null
}

export function ProjectForm({ open, onOpenChange, project }: ProjectFormProps) {
  const isEdit = project != null
  const createProject = useCreateProject()
  const updateProject = useUpdateProject()
  const mutation = isEdit ? updateProject : createProject
  const [color, setColor] = useState(PALETTE[0])

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProjectFormValues>()

  useEffect(() => {
    if (open) {
      reset({ name: project?.name ?? '', description: project?.description ?? '' })
      setColor(project?.color ?? PALETTE[0])
    }
  }, [open, project, reset])

  function onSubmit(values: ProjectFormValues) {
    const body = { name: values.name, description: values.description || undefined, color }
    const options = { onSuccess: () => onOpenChange(false) }
    if (project) updateProject.mutate({ id: project.id, ...body }, options)
    else createProject.mutate(body, options)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit project' : 'New project'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3" noValidate>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="project-name">Name</Label>
            <Input
              id="project-name"
              placeholder="e.g. Website redesign"
              {...register('name', { required: 'Name is required', maxLength: 100 })}
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="project-description">Description</Label>
            <Textarea
              id="project-description"
              placeholder="What is this project about?"
              {...register('description')}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Color</Label>
            <div className="flex gap-2" role="radiogroup" aria-label="Project color">
              {PALETTE.map((swatch) => (
                <button
                  key={swatch}
                  type="button"
                  role="radio"
                  aria-checked={color === swatch}
                  aria-label={`Color ${swatch}`}
                  onClick={() => setColor(swatch)}
                  className={cn(
                    'h-6 w-6 rounded-full transition-transform',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background',
                    color === swatch && 'scale-110 ring-2 ring-ring ring-offset-2',
                  )}
                  style={{ backgroundColor: swatch }}
                />
              ))}
            </div>
          </div>

          {mutation.isError && (
            <p role="alert" className="text-xs text-destructive">
              {getApiErrorMessage(mutation.error, 'Could not save the project')}
            </p>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending && <Spinner />}
              {isEdit ? 'Save changes' : 'Create project'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
