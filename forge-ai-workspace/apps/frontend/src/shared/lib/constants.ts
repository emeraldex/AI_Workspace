// File: apps/frontend/src/shared/lib/constants.ts
export const PRIORITY_COLORS = {
  LOW:    'text-slate-400 bg-slate-400/10 border-slate-400/20',
  MEDIUM: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  HIGH:   'text-orange-400 bg-orange-400/10 border-orange-400/20',
  URGENT: 'text-red-400 bg-red-400/10 border-red-400/20',
} as const

export const STATUS_COLORS = {
  TODO:        'text-slate-400 bg-slate-400/10',
  IN_PROGRESS: 'text-blue-400 bg-blue-400/10',
  IN_REVIEW:   'text-purple-400 bg-purple-400/10',
  DONE:        'text-green-400 bg-green-400/10',
  CANCELLED:   'text-slate-500 bg-slate-500/10 line-through',
} as const

export const PRIORITY_LABELS = {
  LOW: 'Low', MEDIUM: 'Medium', HIGH: 'High', URGENT: 'Urgent',
} as const

export const STATUS_LABELS = {
  TODO: 'To Do', IN_PROGRESS: 'In Progress', IN_REVIEW: 'In Review',
  DONE: 'Done', CANCELLED: 'Cancelled',
} as const
