// File: apps/backend/src/infrastructure/queue/jobs/reminders.job.ts
// Purpose: Task reminders sweep job contract — a periodic, payload-free job
//          that scans all users' tasks for due-soon / overdue reminders.

export const REMINDERS_QUEUE_NAME = 'task-reminders'

// The sweep carries no payload; each run re-derives candidates from the DB.
export type RemindersSweepJob = Record<string, never>
