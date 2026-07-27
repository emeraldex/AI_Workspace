// File: apps/backend/src/infrastructure/queue/workers/reminders.worker.ts
// Purpose: Task reminders sweep processor — finds due-soon (next 24h) and
//          overdue tasks across all users, honors each owner's notification
//          toggles, and creates at most one notification per task+type.

import { logger } from '../../../shared/logger'
import { prisma } from '../../database/prisma.client'
import { settingsService } from '../../../domains/settings/settings.service'
import { notificationsService } from '../../../domains/notifications/notifications.service'
import { remindersQueue } from '../queue.client'
import type { NotificationType, Task, TaskStatus } from '@prisma/client'

const DUE_SOON_WINDOW_MS = 24 * 60 * 60 * 1000
const EXCLUDED_STATUSES: TaskStatus[] = ['DONE', 'CANCELLED']

function formatDueDate(dueDate: Date): string {
  return dueDate.toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'UTC',
  })
}

/** One full sweep. Exported for direct invocation (tests, one-off scripts). */
export async function processRemindersSweep(): Promise<{ notified: number; skipped: number }> {
  const now = new Date()
  const soonCutoff = new Date(now.getTime() + DUE_SOON_WINDOW_MS)

  const [overdue, dueSoon] = await Promise.all([
    prisma.task.findMany({
      where: { deletedAt: null, status: { notIn: EXCLUDED_STATUSES }, dueDate: { lt: now } },
    }),
    prisma.task.findMany({
      where: { deletedAt: null, status: { notIn: EXCLUDED_STATUSES }, dueDate: { gte: now, lte: soonCutoff } },
    }),
  ])

  const candidates: Array<{ task: Task; type: NotificationType }> = [
    ...overdue.map((task) => ({ task, type: 'TASK_OVERDUE' as NotificationType })),
    ...dueSoon.map((task) => ({ task, type: 'TASK_DUE_SOON' as NotificationType })),
  ]

  if (candidates.length === 0) {
    logger.info({ notified: 0, skipped: 0 }, 'Reminders sweep complete — no candidates')
    return { notified: 0, skipped: 0 }
  }

  const userIds = [...new Set(candidates.map((c) => c.task.userId))]

  // Dedup in one query: task ids are unique per owner, so type:taskId keys suffice.
  const existing = await prisma.notification.findMany({
    where: { userId: { in: userIds }, type: { in: ['TASK_DUE_SOON', 'TASK_OVERDUE'] } },
    select: { type: true, metadata: true },
  })
  const alreadyNotified = new Set(
    existing
      .map((n) => `${n.type}:${(n.metadata as { taskId?: string } | null)?.taskId ?? ''}`)
      .filter((key) => !key.endsWith(':')),
  )

  // Settings once per user, not per task
  const settingsByUser = new Map<string, Awaited<ReturnType<typeof settingsService.getSettings>>>()
  for (const userId of userIds) {
    settingsByUser.set(userId, await settingsService.getSettings(userId))
  }

  let notified = 0
  let skipped = 0

  for (const { task, type } of candidates) {
    const key = `${type}:${task.id}`
    if (alreadyNotified.has(key)) {
      skipped++
      continue
    }

    const settings = settingsByUser.get(task.userId)
    const enabled = type === 'TASK_DUE_SOON' ? settings?.notifyTaskDueSoon : settings?.notifyTaskOverdue
    if (!enabled) {
      skipped++
      continue
    }

    const due = formatDueDate(task.dueDate as Date)
    await notificationsService.create(task.userId, {
      type,
      title: type === 'TASK_DUE_SOON' ? 'Task due soon' : 'Task overdue',
      body:
        type === 'TASK_DUE_SOON'
          ? `"${task.title}" is due ${due} (UTC).`
          : `"${task.title}" was due ${due} (UTC).`,
      metadata: { taskId: task.id },
    })
    alreadyNotified.add(key)
    notified++
  }

  logger.info({ notified, skipped }, 'Reminders sweep complete')
  return { notified, skipped }
}

export function registerRemindersWorker(): void {
  void remindersQueue.process(async () => {
    await processRemindersSweep()
  })

  logger.info('Reminders worker registered')
}
