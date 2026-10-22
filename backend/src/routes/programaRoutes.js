import { Router } from 'express';
import { ProgramaController } from '../controllers/programaController.js';

const router = Router();

router.get('/', ProgramaController.getProgramas);
router.get('/participaciones', ProgramaController.getParticipaciones);
router.get('/linea/:id_linea', ProgramaController.getByLinea);
router.get('/:id', ProgramaController.getById);
router.post('/vincular', ProgramaController.vincular);
router.patch('/vinculaciones/:id', ProgramaController.actualizarEstado);

export default router;
