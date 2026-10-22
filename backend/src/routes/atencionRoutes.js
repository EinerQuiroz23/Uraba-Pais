import { Router } from 'express';
import { AtencionController } from '../controllers/atencionController.js';

const router = Router();

router.get('/', AtencionController.getAll);
router.get('/:id', AtencionController.getById);
router.post('/', AtencionController.create);
router.delete('/:id', AtencionController.delete);

export default router;
