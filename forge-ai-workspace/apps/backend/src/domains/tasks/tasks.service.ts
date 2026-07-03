// File: apps/backend/src/domains/tasks/tasks.service.ts
import { tasksRepository, TaskFilters } from './tasks.repository'
import { NotFoundError } from '../../shared/errors/AppError'

function toTaskDto(task: any) {
  return {
    id: task.id,
    title: task.title,
    description: task.description,
    status: task.status,
    priority: task.priority,
    dueDate: task.dueDate,
    sortOrder: task.sortOrder,
    project: task.project ?? null,
    tags: task.taskTags?.map((tt: any) => tt.tag) ?? [],
    subtasks: task.subtasks ?? undefined,
    subtaskCount: task._count?.subtasks ?? task.subtasks?.length ?? 0,
    completedSubtaskCount: task.subtasks?.filter((s: any) => s.isCompleted).length ?? 0,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
  }
}

export const tasksService = {
  async getAll(userId: string, filters: TaskFilters) {
    const result = await tasksRepository.findAll(userId, filters)
    return {
      data: result.tasks.map(toTaskDto),
      pagination: { nextCursor: result.nextCursor, hasMore: result.hasMore, total: result.total },
    }
  },

  async getById(id: string, userId: string) {
    const task = await tasksRepository.findById(id, userId)
    if (!task) throw new NotFoundError('Task')
    return toTaskDto(task)
  },

  async create(userId: string, data: any) {
    const task = await tasksRepository.create(userId, data)
    return toTaskDto(task)
  },

  async update(id: string, userId: string, data: any) {
    const existing = await tasksRepository.findById(id, userId)
    if (!existing) throw new NotFoundError('Task')
    const task = await tasksRepository.update(id, data)
    return toTaskDto(task)
  },

  async delete(id: string, userId: string) {
    const existing = await tasksRepository.findById(id, userId)
    if (!existing) throw new NotFoundError('Task')
    await tasksRepository.softDelete(id)
  },

  async reorder(updates: { id: string; sortOrder: number; status?: any }[]) {
    const count = await tasksRepository.reorder(updates)
    return { updated: count }
  },

  async createSubtask(taskId: string, userId: string, data: { title: string; sortOrder?: number }) {
    const task = await tasksRepository.findById(taskId, userId)
    if (!task) throw new NotFoundError('Task')
    return tasksRepository.createSubtask(taskId, data)
  },

  async updateSubtask(taskId: string, subtaskId: string, userId: string, data: any) {
    const task = await tasksRepository.findById(taskId, userId)
    if (!task) throw new NotFoundError('Task')
    const subtask = await tasksRepository.findSubtask(subtaskId, taskId)
    if (!subtask) throw new NotFoundError('Subtask')
    return tasksRepository.updateSubtask(subtaskId, data)
  },

  async deleteSubtask(taskId: string, subtaskId: string, userId: string) {
    const task = await tasksRepository.findById(taskId, userId)
    if (!task) throw new NotFoundError('Task')
    const subtask = await tasksRepository.findSubtask(subtaskId, taskId)
    if (!subtask) throw new NotFoundError('Subtask')
    await tasksRepository.deleteSubtask(subtaskId)
  },
}
