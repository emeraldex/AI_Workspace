// File: apps/backend/src/domains/projects/projects.service.ts
import { projectsRepository } from './projects.repository'
import { NotFoundError, ForbiddenError } from '../../shared/errors/AppError'

async function toProjectDto(p: any) {
  const completedCount = await projectsRepository.getCompletedCount(p.id)
  return {
    id: p.id,
    name: p.name,
    description: p.description,
    color: p.color,
    icon: p.icon,
    isArchived: p.isArchived,
    taskCount: p._count?.tasks ?? 0,
    completedCount,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  }
}

export const projectsService = {
  async getAll(userId: string, includeArchived = false) {
    const projects = await projectsRepository.findAll(userId, includeArchived)
    return Promise.all(projects.map(toProjectDto))
  },

  async getById(id: string, userId: string) {
    const project = await projectsRepository.findById(id, userId)
    if (!project) throw new NotFoundError('Project')
    return toProjectDto(project)
  },

  async create(userId: string, data: { name: string; description?: string; color?: string; icon?: string }) {
    const project = await projectsRepository.create(userId, data)
    return toProjectDto({ ...project, _count: { tasks: 0 } })
  },

  async update(id: string, userId: string, data: { name?: string; description?: string; color?: string; icon?: string }) {
    const project = await projectsRepository.findById(id, userId)
    if (!project) throw new NotFoundError('Project')
    const updated = await projectsRepository.update(id, data)
    return toProjectDto({ ...updated, _count: project._count })
  },

  async archive(id: string, userId: string) {
    const project = await projectsRepository.findById(id, userId)
    if (!project) throw new NotFoundError('Project')
    await projectsRepository.update(id, { isArchived: true })
    return { isArchived: true }
  },

  async unarchive(id: string, userId: string) {
    const project = await projectsRepository.findById(id, userId)
    if (!project) throw new NotFoundError('Project')
    await projectsRepository.update(id, { isArchived: false })
    return { isArchived: false }
  },

  async delete(id: string, userId: string) {
    const project = await projectsRepository.findById(id, userId)
    if (!project) throw new NotFoundError('Project')
    await projectsRepository.softDelete(id)
  },
}
