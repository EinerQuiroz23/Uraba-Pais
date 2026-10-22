import { Router } from 'express';
import { MunicipioController } from '../controllers/municipioController.js';

const router = Router();

router.get('/', MunicipioController.getAll);
router.get('/:id', MunicipioController.getById);
router.post('/', MunicipioController.create);
router.put('/:id', MunicipioController.update);
router.delete('/:id', MunicipioController.delete);

export default router;
