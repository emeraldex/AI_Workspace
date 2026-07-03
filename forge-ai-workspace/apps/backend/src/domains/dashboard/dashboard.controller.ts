// File: apps/backend/src/domains/dashboard/dashboard.controller.ts
import { Request, Response } from 'express'
import { dashboardService } from './dashboard.service'

export const dashboardController = {
  async getDashboard(req: Request, res: Response): Promise<void> {
    const data = await dashboardService.getDashboard(req.user!.id)
    res.json({ success: true, data })
  },
}
