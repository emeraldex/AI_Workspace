// File: apps/backend/src/domains/projects/projects.router.ts
import { Router } from 'express'
import { projectsController } from './projects.controller'
import { authenticate } from '../../shared/middleware/authenticate'
import { validate } from '../../shared/middleware/validate'
import { createProjectSchema, updateProjectSchema } from './projects.validator'

const router = Router()
const h = (fn: any) => (req: any, res: any, next: any) => fn(req, res).catch(next)

router.use(authenticate)
router.get('/', h(projectsController.getAll))
router.post('/', validate(createProjectSchema), h(projectsController.create))
router.get('/:id', h(projectsController.getById))
router.patch('/:id', validate(updateProjectSchema), h(projectsController.update))
router.patch('/:id/archive', h(projectsController.archive))
router.patch('/:id/unarchive', h(projectsController.unarchive))
router.delete('/:id', h(projectsController.delete))

export { router as projectsRouter }
