// File: apps/backend/src/domains/dashboard/dashboard.service.ts
// Purpose: Aggregates all dashboard data in parallel — single DB round-trip per widget

import { prisma } from '../../infrastructure/database/prisma.client'

export const dashboardService = {
  async getDashboard(userId: string) {
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000)

    const [
      statusCounts,
      todayTasks,
      overdueTasks,
      recentDocuments,
      recentConversations,
      streak,
    ] = await Promise.all([
      // Task summary by status
      prisma.task.groupBy({
        by: ['status'],
        where: { userId, deletedAt: null },
        _count: { status: true },
      }),

      // Tasks due today
      prisma.task.findMany({
        where: { userId, deletedAt: null, dueDate: { gte: todayStart, lt: todayEnd }, status: { notIn: ['DONE', 'CANCELLED'] } },
        select: { id: true, title: true, priority: true, dueDate: true },
        orderBy: { priority: 'desc' },
        take: 10,
      }),

      // Overdue tasks
      prisma.task.findMany({
        where: { userId, deletedAt: null, dueDate: { lt: todayStart }, status: { notIn: ['DONE', 'CANCELLED'] } },
        select: { id: true, title: true, priority: true, dueDate: true },
        orderBy: { dueDate: 'asc' },
        take: 10,
      }),

      // Recent documents
      prisma.document.findMany({
        where: { userId, deletedAt: null },
        select: { id: true, title: true, updatedAt: true },
        orderBy: { updatedAt: 'desc' },
        take: 5,
      }),

      // Recent conversations
      prisma.conversation.findMany({
        where: { userId, deletedAt: null },
        select: { id: true, title: true, updatedAt: true },
        orderBy: { updatedAt: 'desc' },
        take: 3,
      }),

      // Productivity streak — consecutive days with at least one completed task
      computeStreak(userId),
    ])

    const taskSummary = {
      todo: 0, inProgress: 0, inReview: 0, done: 0, cancelled: 0,
    }
    for (const row of statusCounts) {
      const count = row._count.status
      if (row.status === 'TODO') taskSummary.todo = count
      else if (row.status === 'IN_PROGRESS') taskSummary.inProgress = count
      else if (row.status === 'IN_REVIEW') taskSummary.inReview = count
      else if (row.status === 'DONE') taskSummary.done = count
      else if (row.status === 'CANCELLED') taskSummary.cancelled = count
    }

    return { taskSummary, todayTasks, overdueTasks, recentDocuments, recentConversations, streak }
  },
}

async function computeStreak(userId: string): Promise<number> {
  // Fetch distinct days with completed tasks, ordered descending
  const completedDays = await prisma.task.findMany({
    where: { userId, deletedAt: null, status: 'DONE' },
    select: { updatedAt: true },
    orderBy: { updatedAt: 'desc' },
  })

  const days = new Set(
    completedDays.map((t) => t.updatedAt.toISOString().slice(0, 10)),
  )

  let streak = 0
  const today = new Date()
  for (let i = 0; i < 365; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    if (days.has(key)) streak++
    else if (i > 0) break
  }
  return streak
}
