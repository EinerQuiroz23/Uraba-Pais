import { Router } from 'express';
import { BeneficiarioController } from '../controllers/beneficiarioController.js';

const router = Router();

router.get('/', BeneficiarioController.getAll);
router.post('/check-duplicate', BeneficiarioController.checkDuplicate);
router.get('/:id', BeneficiarioController.getFichaConsolidada);
router.post('/', BeneficiarioController.create);
router.put('/:id', BeneficiarioController.update);
router.delete('/:id', BeneficiarioController.delete);

export default router;
