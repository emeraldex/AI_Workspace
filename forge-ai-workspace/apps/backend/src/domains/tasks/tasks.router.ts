// File: apps/backend/src/domains/tasks/tasks.router.ts
import { Router } from 'express'
import { tasksController } from './tasks.controller'
import { authenticate } from '../../shared/middleware/authenticate'
import { validate } from '../../shared/middleware/validate'
import {
  createTaskSchema, updateTaskSchema, reorderSchema,
  createSubtaskSchema, updateSubtaskSchema,
} from './tasks.validator'

const router = Router()
const h = (fn: any) => (req: any, res: any, next: any) => fn(req, res).catch(next)

router.use(authenticate)
router.get('/', h(tasksController.getAll))
router.post('/', validate(createTaskSchema), h(tasksController.create))
router.patch('/reorder', validate(reorderSchema), h(tasksController.reorder))
router.get('/:id', h(tasksController.getById))
router.patch('/:id', validate(updateTaskSchema), h(tasksController.update))
router.delete('/:id', h(tasksController.delete))
router.post('/:id/subtasks', validate(createSubtaskSchema), h(tasksController.createSubtask))
router.patch('/:id/subtasks/:subtaskId', validate(updateSubtaskSchema), h(tasksController.updateSubtask))
router.delete('/:id/subtasks/:subtaskId', h(tasksController.deleteSubtask))

export { router as tasksRouter }
