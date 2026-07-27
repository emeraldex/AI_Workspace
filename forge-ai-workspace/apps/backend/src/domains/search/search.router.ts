// File: apps/backend/src/domains/search/search.router.ts
import { Router } from 'express'
import { searchController } from './search.controller'
import { authenticate } from '../../shared/middleware/authenticate'
import { validate } from '../../shared/middleware/validate'
import { searchQuerySchema, semanticQuerySchema } from './search.validator'

const router = Router()
const h = (fn: any) => (req: any, res: any, next: any) => fn(req, res).catch(next)

router.use(authenticate)
router.get('/', validate(searchQuerySchema, 'query'), h(searchController.search))
router.get('/semantic', validate(semanticQuerySchema, 'query'), h(searchController.semantic))

export { router as searchRouter }
