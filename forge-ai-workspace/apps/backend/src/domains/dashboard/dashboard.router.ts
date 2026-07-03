// File: apps/backend/src/domains/dashboard/dashboard.router.ts
import { Router } from 'express'
import { dashboardController } from './dashboard.controller'
import { authenticate } from '../../shared/middleware/authenticate'

const router = Router()
const h = (fn: any) => (req: any, res: any, next: any) => fn(req, res).catch(next)

router.use(authenticate)
router.get('/', h(dashboardController.getDashboard))

export { router as dashboardRouter }
