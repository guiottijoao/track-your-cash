import { Router } from "express";
import * as pluggyItemController from '../controllers/pluggy-items-controller'

const router = Router()

router.get('/', pluggyItemController.getAll)
router.get('/:id', pluggyItemController.getById)
router.post('/', pluggyItemController.create)
router.put('/:id',pluggyItemController.update)
router.delete('/:id', pluggyItemController.remove)

export default router