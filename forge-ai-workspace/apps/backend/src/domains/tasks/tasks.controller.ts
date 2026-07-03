// File: apps/backend/src/domains/tasks/tasks.controller.ts
import { Request, Response } from 'express'
import { tasksService } from './tasks.service'

export const tasksController = {
  async getAll(req: Request, res: Response): Promise<void> {
    const q = req.query as any
    const filters = {
      ...q,
      tagIds: q.tagIds ? q.tagIds.split(',') : undefined,
      limit: q.limit ? Number(q.limit) : 20,
    }
    const result = await tasksService.getAll(req.user!.id, filters)
    res.json({ success: true, ...result })
  },

  async getById(req: Request, res: Response): Promise<void> {
    const data = await tasksService.getById(req.params.id, req.user!.id)
    res.json({ success: true, data })
  },

  async create(req: Request, res: Response): Promise<void> {
    const data = await tasksService.create(req.user!.id, req.body)
    res.status(201).json({ success: true, data })
  },

  async update(req: Request, res: Response): Promise<void> {
    const data = await tasksService.update(req.params.id, req.user!.id, req.body)
    res.json({ success: true, data })
  },

  async delete(req: Request, res: Response): Promise<void> {
    await tasksService.delete(req.params.id, req.user!.id)
    res.status(204).send()
  },

  async reorder(req: Request, res: Response): Promise<void> {
    const data = await tasksService.reorder(req.body.updates)
    res.json({ success: true, data })
  },

  async createSubtask(req: Request, res: Response): Promise<void> {
    const data = await tasksService.createSubtask(req.params.id, req.user!.id, req.body)
    res.status(201).json({ success: true, data })
  },

  async updateSubtask(req: Request, res: Response): Promise<void> {
    const data = await tasksService.updateSubtask(req.params.id, req.params.subtaskId, req.user!.id, req.body)
    res.json({ success: true, data })
  },

  async deleteSubtask(req: Request, res: Response): Promise<void> {
    await tasksService.deleteSubtask(req.params.id, req.params.subtaskId, req.user!.id)
    res.status(204).send()
  },
}
