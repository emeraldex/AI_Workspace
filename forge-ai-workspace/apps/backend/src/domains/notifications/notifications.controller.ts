// File: apps/backend/src/domains/notifications/notifications.controller.ts
import { Request, Response } from 'express'
import { notificationsService } from './notifications.service'

export const notificationsController = {
  async getAll(req: Request, res: Response): Promise<void> {
    const q = req.query as any
    const filters = { unreadOnly: q.unreadOnly === 'true', cursor: q.cursor, limit: q.limit ? Number(q.limit) : 20 }
    const result = await notificationsService.getAll(req.user!.id, filters)
    res.json({ success: true, ...result })
  },

  async markRead(req: Request, res: Response): Promise<void> {
    const data = await notificationsService.markRead(req.params.id, req.user!.id)
    res.json({ success: true, data })
  },

  async markAllRead(req: Request, res: Response): Promise<void> {
    const data = await notificationsService.markAllRead(req.user!.id)
    res.json({ success: true, data })
  },

  async delete(req: Request, res: Response): Promise<void> {
    await notificationsService.delete(req.params.id, req.user!.id)
    res.status(204).send()
  },
}
