// File: apps/backend/src/domains/settings/settings.router.ts
import { Router } from 'express'
import { settingsController } from './settings.controller'
import { authenticate } from '../../shared/middleware/authenticate'
import { validate } from '../../shared/middleware/validate'
import { updateSettingsSchema } from './settings.validator'

const router = Router()
const h = (fn: any) => (req: any, res: any, next: any) => fn(req, res).catch(next)

router.use(authenticate)
router.get('/', h(settingsController.getSettings))
router.patch('/', validate(updateSettingsSchema), h(settingsController.updateSettings))

export { router as settingsRouter }
