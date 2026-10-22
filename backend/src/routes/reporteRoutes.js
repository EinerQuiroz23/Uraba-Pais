import { Router } from 'express';
import { ReporteController } from '../controllers/reporteController.js';

const router = Router();

router.get('/metricas', ReporteController.getMetricas);
router.get('/resumen', ReporteController.getResumen);

export default router;
