// File: apps/frontend/src/features/projects/hooks/useProjects.ts
// Purpose: Projects query + mutations. Invalidates the 'projects' root key,
//          which also covers the project-options query used by the tasks feature.

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  projectsApi,
  type CreateProjectInput,
  type UpdateProjectInput,
} from '../api/projects.api'

export const PROJECTS_QUERY_KEY = 'projects'

export function useProjects(includeArchived: boolean) {
  return useQuery({
    queryKey: [PROJECTS_QUERY_KEY, { includeArchived }],
    queryFn: () => projectsApi.list(includeArchived),
  })
}

function useInvalidateProjects() {
  const queryClient = useQueryClient()
  return () => {
    void queryClient.invalidateQueries({ queryKey: [PROJECTS_QUERY_KEY] })
    // Task cards render project names/colors
    void queryClient.invalidateQueries({ queryKey: ['tasks'] })
  }
}

export function useCreateProject() {
  const invalidate = useInvalidateProjects()
  return useMutation({
    mutationFn: (body: CreateProjectInput) => projectsApi.create(body),
    onSuccess: invalidate,
  })
}

export function useUpdateProject() {
  const invalidate = useInvalidateProjects()
  return useMutation({
    mutationFn: ({ id, ...body }: UpdateProjectInput & { id: string }) =>
      projectsApi.update(id, body),
    onSuccess: invalidate,
  })
}

export function useArchiveProject() {
  const invalidate = useInvalidateProjects()
  return useMutation({
    mutationFn: (id: string) => projectsApi.archive(id),
    onSuccess: invalidate,
  })
}

export function useUnarchiveProject() {
  const invalidate = useInvalidateProjects()
  return useMutation({
    mutationFn: (id: string) => projectsApi.unarchive(id),
    onSuccess: invalidate,
  })
}

export function useDeleteProject() {
  const invalidate = useInvalidateProjects()
  return useMutation({
    mutationFn: (id: string) => projectsApi.remove(id),
    onSuccess: invalidate,
  })
}
