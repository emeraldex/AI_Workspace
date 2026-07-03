// File: apps/backend/src/domains/conversations/conversations.controller.ts
import { Request, Response } from 'express'
import { conversationsService } from './conversations.service'

export const conversationsController = {
  async getAll(req: Request, res: Response): Promise<void> {
    const q = req.query as any
    const result = await conversationsService.getAll(req.user!.id, { cursor: q.cursor, limit: q.limit ? Number(q.limit) : 20 })
    res.json({ success: true, ...result })
  },

  async getById(req: Request, res: Response): Promise<void> {
    const data = await conversationsService.getById(req.params.id, req.user!.id)
    res.json({ success: true, data })
  },

  async create(req: Request, res: Response): Promise<void> {
    const data = await conversationsService.create(req.user!.id, req.body.title)
    res.status(201).json({ success: true, data })
  },

  async update(req: Request, res: Response): Promise<void> {
    const data = await conversationsService.update(req.params.id, req.user!.id, req.body)
    res.json({ success: true, data })
  },

  async delete(req: Request, res: Response): Promise<void> {
    await conversationsService.delete(req.params.id, req.user!.id)
    res.status(204).send()
  },

  async sendMessage(req: Request, res: Response): Promise<void> {
    const { content } = req.body
    const data = await conversationsService.sendMessage(req.params.id, req.user!.id, content)
    res.status(201).json({ success: true, data })
  },
}
