// File: apps/backend/src/domains/users/users.router.ts
import { Router } from 'express'
import { usersController } from './users.controller'
import { authenticate } from '../../shared/middleware/authenticate'
import { validate } from '../../shared/middleware/validate'
import { updateProfileSchema } from './users.validator'

const router = Router()
const h = (fn: any) => (req: any, res: any, next: any) => fn(req, res).catch(next)

router.use(authenticate)
router.get('/me', h(usersController.getMe))
router.patch('/me', validate(updateProfileSchema), h(usersController.updateMe))
router.delete('/me', h(usersController.deleteMe))

export { router as usersRouter }
