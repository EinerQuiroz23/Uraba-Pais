import { Router } from 'express';
import { DatabaseController } from '../controllers/databaseController.js';

const router = Router();

router.get('/status', DatabaseController.getStatus);

export default router;
