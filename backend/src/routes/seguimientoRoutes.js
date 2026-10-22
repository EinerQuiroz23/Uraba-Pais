import { Router } from 'express';
import { SeguimientoController } from '../controllers/seguimientoController.js';

const router = Router();

router.get('/', SeguimientoController.getAll);
router.post('/', SeguimientoController.create);
router.patch('/:id/toggle', SeguimientoController.toggleEstado);
router.delete('/:id', SeguimientoController.delete);

export default router;
