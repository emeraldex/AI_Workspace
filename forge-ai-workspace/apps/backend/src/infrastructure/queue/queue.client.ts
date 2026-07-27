// File: apps/backend/src/infrastructure/queue/queue.client.ts
// Purpose: Bull queue instances (Redis-backed). Jobs are processed in-process
//          by workers registered at server startup.

import Queue from 'bull'
import { config } from '../../shared/config'
import { logger } from '../../shared/logger'
import { RAG_QUEUE_NAME, type RagIndexJob } from './jobs/rag.job'
import { REMINDERS_QUEUE_NAME, type RemindersSweepJob } from './jobs/reminders.job'

export const ragQueue = new Queue<RagIndexJob>(RAG_QUEUE_NAME, config.redisUrl, {
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 },
    removeOnComplete: 100,
    removeOnFail: 500,
  },
})

ragQueue.on('error', (err) => logger.error({ err }, 'RAG queue error'))

// One job per document. The worker reads the document from the DB at process
// time, so an already-waiting job covers newer edits; a finished job must be
// removed first (Bull silently ignores add() when the jobId still exists).
export async function enqueueRagIndex(job: RagIndexJob): Promise<void> {
  const jobId = `doc:${job.documentId}`
  const existing = await ragQueue.getJob(jobId)
  if (existing) {
    const state = await existing.getState()
    if (state === 'waiting' || state === 'delayed' || state === 'active') return
    await existing.remove()
  }
  await ragQueue.add(job, { jobId })
}

export const remindersQueue = new Queue<RemindersSweepJob>(REMINDERS_QUEUE_NAME, config.redisUrl, {
  defaultJobOptions: {
    removeOnComplete: 20,
    removeOnFail: 100,
  },
})

remindersQueue.on('error', (err) => logger.error({ err }, 'Reminders queue error'))

export const REMINDERS_SWEEP_CRON = '*/15 * * * *'

// Register the repeatable sweep. The fixed jobId makes registration idempotent
// across restarts — Bull keys repeatables by (jobId, cron), so re-adding the
// same pair does not accumulate duplicates.
export async function scheduleRemindersSweep(): Promise<void> {
  await remindersQueue.add({}, { repeat: { cron: REMINDERS_SWEEP_CRON }, jobId: 'reminders-sweep' })
}
