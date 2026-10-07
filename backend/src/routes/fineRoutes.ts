import { Router } from 'express';
import { getMyFines, payFine } from '../controllers/fineController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.use(authenticateToken);

router.get('/my', getMyFines);
router.post('/:id/pay', payFine);

export default router;
