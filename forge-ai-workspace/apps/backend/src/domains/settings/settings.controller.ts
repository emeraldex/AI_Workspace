// File: apps/backend/src/domains/settings/settings.controller.ts
import { Request, Response } from 'express'
import { settingsService } from './settings.service'

export const settingsController = {
  async getSettings(req: Request, res: Response): Promise<void> {
    const data = await settingsService.getSettings(req.user!.id)
    res.json({ success: true, data })
  },

  async updateSettings(req: Request, res: Response): Promise<void> {
    const data = await settingsService.updateSettings(req.user!.id, req.body)
    res.json({ success: true, data })
  },
}
