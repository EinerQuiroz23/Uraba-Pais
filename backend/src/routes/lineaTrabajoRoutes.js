import { Router } from 'express';
import { LineaTrabajoController } from '../controllers/lineaTrabajoController.js';

const router = Router();

router.get('/', LineaTrabajoController.getAll);
router.get('/con-programas', LineaTrabajoController.getAllWithProgramas);
router.get('/:id', LineaTrabajoController.getById);
router.post('/', LineaTrabajoController.create);
router.put('/:id', LineaTrabajoController.update);
router.delete('/:id', LineaTrabajoController.delete);

export default router;
