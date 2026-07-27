// File: apps/backend/src/domains/tasks/tasks.repository.ts
import { prisma } from '../../infrastructure/database/prisma.client'
import { TaskStatus, TaskPriority } from '@prisma/client'

export interface TaskFilters {
  projectId?: string
  status?: TaskStatus
  priority?: TaskPriority
  tagIds?: string[]
  dueBefore?: Date
  dueAfter?: Date
  search?: string
  cursor?: string
  limit?: number
}

export const tasksRepository = {
  async findAll(userId: string, filters: TaskFilters) {
    const limit = Math.min(filters.limit ?? 20, 100)

    const where: any = {
      userId,
      deletedAt: null,
      ...(filters.projectId && { projectId: filters.projectId }),
      ...(filters.status && { status: filters.status }),
      ...(filters.priority && { priority: filters.priority }),
      ...(filters.dueBefore || filters.dueAfter
        ? {
            dueDate: {
              ...(filters.dueBefore && { lte: filters.dueBefore }),
              ...(filters.dueAfter && { gte: filters.dueAfter }),
            },
          }
        : {}),
      ...(filters.tagIds?.length && {
        taskTags: { some: { tagId: { in: filters.tagIds } } },
      }),
      ...(filters.search && {
        OR: [
          { title: { contains: filters.search, mode: 'insensitive' } },
          { description: { contains: filters.search, mode: 'insensitive' } },
        ],
      }),
      ...(filters.cursor && { id: { lt: filters.cursor } }),
    }

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        include: {
          project: { select: { id: true, name: true, color: true } },
          taskTags: { include: { tag: { select: { id: true, name: true, color: true } } } },
          _count: { select: { subtasks: true } },
        },
        orderBy: [{ dueDate: 'asc' }, { createdAt: 'desc' }],
        take: limit + 1,
      }),
      prisma.task.count({ where }),
    ])

    const hasMore = tasks.length > limit
    if (hasMore) tasks.pop()

    // _count only carries totals — fetch completed-subtask counts separately
    // so list/board rows can show real progress (e.g. 1/2)
    const completedCounts = await prisma.subtask.groupBy({
      by: ['taskId'],
      where: { taskId: { in: tasks.map((t) => t.id) }, isCompleted: true },
      _count: { taskId: true },
    })
    const completedByTask = new Map(completedCounts.map((c) => [c.taskId, c._count.taskId]))
    const tasksWithProgress = tasks.map((t) => ({
      ...t,
      completedSubtaskCount: completedByTask.get(t.id) ?? 0,
    }))

    return {
      tasks: tasksWithProgress,
      total,
      hasMore,
      nextCursor: hasMore ? (tasks[tasks.length - 1]?.id ?? null) : null,
    }
  },

  async findById(id: string, userId: string) {
    return prisma.task.findFirst({
      where: { id, userId, deletedAt: null },
      include: {
        project: { select: { id: true, name: true, color: true } },
        taskTags: { include: { tag: { select: { id: true, name: true, color: true } } } },
        subtasks: { orderBy: { sortOrder: 'asc' } },
      },
    })
  },

  async create(userId: string, data: any) {
    const { tagIds, ...taskData } = data
    return prisma.task.create({
      data: {
        userId,
        ...taskData,
        ...(tagIds?.length && {
          taskTags: { create: tagIds.map((tagId: string) => ({ tagId })) },
        }),
      },
      include: {
        project: { select: { id: true, name: true, color: true } },
        taskTags: { include: { tag: { select: { id: true, name: true, color: true } } } },
        _count: { select: { subtasks: true } },
      },
    })
  },

  async update(id: string, data: any) {
    const { tagIds, ...taskData } = data
    return prisma.task.update({
      where: { id },
      data: {
        ...taskData,
        ...(tagIds !== undefined && {
          taskTags: { deleteMany: {}, create: tagIds.map((tagId: string) => ({ tagId })) },
        }),
      },
      include: {
        project: { select: { id: true, name: true, color: true } },
        taskTags: { include: { tag: { select: { id: true, name: true, color: true } } } },
        _count: { select: { subtasks: true } },
      },
    })
  },

  async softDelete(id: string) {
    return prisma.task.update({ where: { id }, data: { deletedAt: new Date() } })
  },

  async reorder(updates: { id: string; sortOrder: number; status?: TaskStatus }[]) {
    await prisma.$transaction(
      updates.map(({ id, sortOrder, status }) =>
        prisma.task.update({ where: { id }, data: { sortOrder, ...(status && { status }) } }),
      ),
    )
    return updates.length
  },

  async createSubtask(taskId: string, data: { title: string; sortOrder?: number }) {
    return prisma.subtask.create({ data: { taskId, ...data } })
  },

  async updateSubtask(id: string, data: { title?: string; isCompleted?: boolean; sortOrder?: number }) {
    return prisma.subtask.update({ where: { id }, data })
  },

  async deleteSubtask(id: string) {
    return prisma.subtask.delete({ where: { id } })
  },

  async findSubtask(id: string, taskId: string) {
    return prisma.subtask.findFirst({ where: { id, taskId } })
  },

  async getCompletedSubtaskCount(taskId: string) {
    return prisma.subtask.count({ where: { taskId, isCompleted: true } })
  },
}
